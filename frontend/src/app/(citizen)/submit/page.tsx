"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import {
  AttachmentUpload,
  type UploadedAttachment,
} from "@/components/feedback/AttachmentUpload";
import { Button } from "@/components/ui/Button";
import { DistrictSelect } from "@/components/ui/DistrictSelect";
import { Input } from "@/components/ui/Input";
import { FieldError, Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import {
  feedback as feedbackApi,
  services as servicesApi,
  apiErrorMessage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FeedbackFrequency, ServiceItem } from "@/types";

const STEPS = ["Service", "Details", "Review"] as const;
type Step = (typeof STEPS)[number];

const FREQUENCY_OPTIONS: { id: FeedbackFrequency; label: string }[] = [
  { id: "once", label: "Once" },
  { id: "weekly", label: "Weekly" },
  { id: "daily", label: "Daily" },
  { id: "ongoing", label: "Ongoing" },
];

interface FormState {
  service_id: number | null;
  district: string;
  specific: string;
  location: string;
  frequency: FeedbackFrequency | null;
  feedback_text: string;
}

const INITIAL: FormState = {
  service_id: null,
  district: "",
  specific: "",
  location: "",
  frequency: null,
  feedback_text: "",
};

export default function SubmitFeedbackPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [step, setStep] = useState<Step>("Service");
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    servicesApi.list().then(({ data }) => setServices(data)).catch(() => {});
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.service_id === form.service_id) ?? null,
    [services, form.service_id],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(target: Step): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (target === "Details" || target === "Review") {
      if (!form.service_id) next.service_id = "Choose a service";
    }
    if (target === "Review") {
      if (!form.location.trim()) next.location = "Add a location";
      if (!form.frequency) next.frequency = "Pick a frequency";
      if (form.feedback_text.trim().length < 20)
        next.feedback_text = "At least 20 characters";
      if (form.feedback_text.trim().length > 1000)
        next.feedback_text = "At most 1000 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function go(direction: "next" | "back") {
    const idx = STEPS.indexOf(step);
    if (direction === "back" && idx > 0) {
      setStep(STEPS[idx - 1]);
      return;
    }
    if (direction === "next" && idx < STEPS.length - 1) {
      const target = STEPS[idx + 1];
      if (!validateStep(target)) return;
      setStep(target);
    }
  }

  async function submit() {
    if (!validateStep("Review")) return;
    setSubmitting(true);
    try {
      await feedbackApi.create({
        service_id: form.service_id!,
        location: form.location.trim(),
        frequency: form.frequency!,
        feedback_text: form.feedback_text.trim(),
        attachment_urls: attachments.map((a) => a.url),
      });
      toast.success("Feedback submitted. We'll keep you updated.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not submit feedback"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-text-tertiary mb-2">
          Submit feedback
        </p>
        <h1 className="font-display text-3xl text-primary-950">
          Tell us what&apos;s wrong.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Three short steps. We&apos;ll forward your feedback to the right
          authority.
        </p>
      </header>

      <ol className="flex items-center gap-3 mb-10">
        {STEPS.map((label, i) => {
          const idx = STEPS.indexOf(step);
          const active = i === idx;
          const done = i < idx;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-fast",
                  done
                    ? "border-status-solved bg-status-solved-bg text-status-solved"
                    : active
                      ? "border-primary-900 bg-primary-900 text-text-inverse"
                      : "border-border text-text-tertiary",
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={cn(
                  active ? "text-text-primary font-medium" : "text-text-tertiary",
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "w-8 h-px transition-colors duration-fast",
                    done ? "bg-status-solved" : "bg-border-subtle",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {step === "Service" ? (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-primary-950">
              What type of issue is this?
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Select the public service this feedback is about.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => {
              const selected = service.service_id === form.service_id;
              return (
                <button
                  key={service.service_id}
                  type="button"
                  onClick={() => update("service_id", service.service_id)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-colors duration-fast",
                    selected
                      ? "border-2 border-primary-700 bg-primary-50"
                      : "border-border bg-bg-elevated hover:border-border-strong",
                  )}
                >
                  <p className="font-medium text-text-primary">
                    {service.service_name}
                  </p>
                  {service.description ? (
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {service.description}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.service_id} />
        </section>
      ) : null}

      {step === "Details" ? (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-primary-950">
              Describe the issue.
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Be specific — what happened, where exactly, how it affects you.
            </p>
          </div>

          <div>
            <Label htmlFor="district">District</Label>
            <DistrictSelect
              id="district"
              value={form.district}
              onChange={(e) => {
                const district = e.target.value;
                update("district", district);
                // If specific is empty, prefill location with district name.
                if (!form.specific.trim()) {
                  update("location", district);
                } else {
                  update(
                    "location",
                    district ? `${form.specific}, ${district}` : form.specific,
                  );
                }
              }}
              invalid={Boolean(errors.location)}
            />
          </div>

          <div>
            <Label htmlFor="specific">
              Specific location{" "}
              <span className="text-text-tertiary normal-case">(optional)</span>
            </Label>
            <Input
              id="specific"
              value={form.specific}
              onChange={(e) => {
                const specific = e.target.value;
                update("specific", specific);
                update(
                  "location",
                  form.district
                    ? specific.trim()
                      ? `${specific}, ${form.district}`
                      : form.district
                    : specific,
                );
              }}
              placeholder="Street, neighbourhood, or landmark"
            />
            <FieldError message={errors.location} />
          </div>

          <div>
            <Label htmlFor="feedback_text">Description</Label>
            <Textarea
              id="feedback_text"
              value={form.feedback_text}
              onChange={(e) => update("feedback_text", e.target.value)}
              maxLength={1000}
              placeholder="What happened? Where exactly? How long has it been going on?"
              invalid={Boolean(errors.feedback_text)}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError message={errors.feedback_text} />
              <span className="text-xs text-text-tertiary">
                {form.feedback_text.length} / 1000
              </span>
            </div>
          </div>

          <div>
            <Label>Frequency</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FREQUENCY_OPTIONS.map((option) => {
                const selected = form.frequency === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => update("frequency", option.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors duration-fast",
                      selected
                        ? "border-2 border-primary-700 bg-primary-50 text-text-primary"
                        : "border-border bg-bg-elevated text-text-secondary hover:border-border-strong",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.frequency} />
          </div>

          <div>
            <Label>Photo attachments (optional)</Label>
            <AttachmentUpload value={attachments} onChange={setAttachments} />
          </div>
        </section>
      ) : null}

      {step === "Review" ? (
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-primary-950">
              Review your feedback.
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Make sure everything looks right.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Service
              </dt>
              <dd className="text-text-primary mt-1">
                {selectedService?.service_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Location
              </dt>
              <dd className="text-text-primary mt-1">{form.location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Frequency
              </dt>
              <dd className="text-text-primary mt-1 capitalize">
                {form.frequency}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Attachments
              </dt>
              <dd className="text-text-primary mt-1">
                {attachments.length === 0
                  ? "None"
                  : `${attachments.length} photo${attachments.length === 1 ? "" : "s"}`}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-text-tertiary">
                Description
              </dt>
              <dd className="text-text-primary mt-1 leading-relaxed whitespace-pre-wrap">
                {form.feedback_text}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="flex items-center justify-between mt-10">
        <Button
          variant="ghost"
          onClick={() => go("back")}
          disabled={step === STEPS[0]}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        {step === "Review" ? (
          <Button variant="accent" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size={16} />
                Submitting…
              </>
            ) : (
              <>
                Submit feedback
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={() => go("next")}>
            Next
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
