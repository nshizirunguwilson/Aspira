import type { ReactNode } from "react";

export function AuthSplit({
  children,
  testimonial = "“Finally, I can see my road repair request is actually being processed.”",
  attribution = "— G. Uwimana, Gasabo District",
}: {
  children: ReactNode;
  testimonial?: string;
  attribution?: string;
}) {
  return (
    <div className="grid lg:grid-cols-12 min-h-[calc(100vh-var(--nav-height))]">
      <section className="lg:col-span-5 flex items-center justify-center px-6 py-16 lg:px-12 lg:py-20 bg-bg-elevated">
        <div className="w-full max-w-md">{children}</div>
      </section>
      <section
        aria-hidden
        className="hidden lg:col-span-7 lg:flex items-end p-16 bg-bg-inverse text-text-inverse relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-12 left-12 h-72 w-72 rounded-2xl"
            style={{ background: "var(--color-primary-800)", opacity: 0.6 }}
          />
          <div
            className="absolute top-32 left-44 h-56 w-56 rounded-2xl"
            style={{ background: "var(--color-primary-700)", opacity: 0.7 }}
          />
          <div
            className="absolute top-56 left-16 h-40 w-80 rounded-2xl"
            style={{ background: "var(--color-primary-600)", opacity: 0.5 }}
          />
          <div
            className="absolute bottom-24 right-20 h-48 w-48 rounded-2xl"
            style={{ background: "var(--color-accent-700)", opacity: 0.45 }}
          />
        </div>
        <blockquote className="relative max-w-md font-display text-3xl leading-snug">
          {testimonial}
          <footer className="mt-6 font-body text-sm text-text-inverse/70">
            {attribution}
          </footer>
        </blockquote>
      </section>
    </div>
  );
}
