export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-subtle py-10 mt-20">
      <div className="max-w-content mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-text-tertiary">
        <p className="font-display text-lg text-primary-950">Aspira</p>
        <p>A structured channel for civic improvement.</p>
        <p>© {new Date().getFullYear()} Aspira</p>
      </div>
    </footer>
  );
}
