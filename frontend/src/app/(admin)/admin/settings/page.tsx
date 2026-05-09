"use client";

import {
  AlertTriangle,
  Cloud,
  Database,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { admin as adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <Icon size={18} />
        </span>
        <div className="flex-1">
          <h2 className="text-text-primary font-medium">{title}</h2>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  return (
    <div className="px-8 py-10 max-w-3xl mx-auto space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-text-tertiary">
          Settings
        </p>
        <h1 className="font-display text-3xl text-primary-950 mt-2">
          Workspace
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Configuration and connections for your Aspira deployment.
        </p>
      </header>

      <SettingsCard
        icon={ShieldCheck}
        title="Signed in as"
        description={`${user?.name ?? ""} · administrator`}
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-text-tertiary">
              Username
            </dt>
            <dd className="text-text-primary mt-1">{user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-text-tertiary">
              Role
            </dt>
            <dd className="text-text-primary mt-1">Administrator</dd>
          </div>
        </dl>
      </SettingsCard>

      <SettingsCard
        icon={Database}
        title="API connection"
        description="The backend the dashboard talks to."
      >
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-text-tertiary">
              API base URL
            </dt>
            <dd className="text-text-primary mt-1 font-mono text-xs break-all">
              {apiBase}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-text-tertiary">
              Interactive docs
            </dt>
            <dd className="text-text-primary mt-1">
              <a
                href={`${apiBase}/api/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-accent hover:underline"
              >
                /api/docs →
              </a>
            </dd>
          </div>
        </dl>
      </SettingsCard>

      <SettingsCard
        icon={Cloud}
        title="File uploads"
        description="Cloudinary direct-browser uploads with an unsigned preset."
      >
        <p className="text-sm text-text-secondary">
          Configure{" "}
          <code className="text-xs font-mono bg-bg-subtle px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          </code>{" "}
          and{" "}
          <code className="text-xs font-mono bg-bg-subtle px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          </code>{" "}
          on the frontend, plus the matching credentials on the backend.
          Without these, the submit form prompts users to submit without
          attachments.
        </p>
      </SettingsCard>

      <SettingsCard
        icon={Mail}
        title="Transactional email"
        description="Brevo handles the welcome / submission / status-change notifications."
      >
        <p className="text-sm text-text-secondary">
          Set{" "}
          <code className="text-xs font-mono bg-bg-subtle px-1.5 py-0.5 rounded">
            BREVO_API_KEY
          </code>{" "}
          on the backend to enable. When unset, send calls log and skip
          silently — user-facing requests still succeed.
        </p>
      </SettingsCard>

      <SettingsCard
        icon={KeyRound}
        title="Add another administrator"
        description="Run the seed CLI on the backend host."
      >
        <pre className="text-xs font-mono bg-bg-subtle text-text-primary rounded-md p-3 overflow-x-auto">
{`cd backend
python -m scripts.create_admin
# or non-interactively:
ASPIRA_ADMIN_USERNAME=ops \\
ASPIRA_ADMIN_EMAIL=ops@aspira.gov.rw \\
ASPIRA_ADMIN_PASSWORD=... \\
ASPIRA_ADMIN_ROLE=service_admin \\
python -m scripts.create_admin`}
        </pre>
      </SettingsCard>

      <SettingsCard
        icon={AlertTriangle}
        title="Export data"
        description="Download every feedback row as CSV for offline analysis."
      >
        <a
          href={adminApi.exportCsvUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-accent hover:underline"
        >
          Download CSV →
        </a>
      </SettingsCard>
    </div>
  );
}
