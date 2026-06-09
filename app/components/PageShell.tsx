import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.2),transparent_30%),#080914] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-pink-200">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
            {description}
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
