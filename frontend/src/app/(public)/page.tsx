import Link from "next/link";

import { FeedbackBoard } from "@/components/feedback/FeedbackBoard";
import { Button } from "@/components/ui/Button";

export default function PublicLandingPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border-subtle">
        <div className="max-w-content mx-auto grid lg:grid-cols-12 gap-10 px-6 pt-20 pb-16">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <p className="text-xs uppercase tracking-widest text-text-accent">
              Aspira · Public service tracker
            </p>
            <h1 className="font-display text-5xl text-primary-950 leading-tight">
              Your feedback,
              <br />
              tracked to resolution.
            </h1>
            <p className="text-md text-text-secondary max-w-[480px] leading-relaxed">
              Every submission is reviewed by a responsible authority. Real
              services. Real accountability.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/submit">
                <Button size="lg">Submit feedback</Button>
              </Link>
              <a href="#board">
                <Button variant="ghost" size="lg">
                  Browse issues →
                </Button>
              </a>
            </div>
          </div>

          <aside className="lg:col-span-5 flex flex-col justify-end">
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-6 space-y-3">
              <p className="text-xs uppercase tracking-widest text-text-tertiary">
                Recent activity
              </p>
              <p className="text-sm text-text-secondary">
                Live feedback rolls in from across districts. Browse the public
                board below to see what citizens are reporting and how
                administrators are responding.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <div id="board" className="max-w-content mx-auto px-6 py-12 w-full">
        <FeedbackBoard />
      </div>

      <section className="bg-bg-inverse text-text-inverse">
        <div className="max-w-content mx-auto px-6 py-20 flex flex-col gap-6">
          <p className="text-xs uppercase tracking-widest text-text-inverse/60">
            Ready to be heard?
          </p>
          <h2 className="font-display text-4xl leading-tight max-w-xl">
            Submit your feedback. We&apos;ll make sure someone is accountable for
            it.
          </h2>
          <div>
            <Link href="/submit">
              <Button variant="accent" size="lg">
                Submit feedback →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
