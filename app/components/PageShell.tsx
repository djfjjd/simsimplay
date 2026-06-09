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
    <main className="min-h-screen bg-[#080914] px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="mb-2 text-sm font-bold tracking-wider text-violet-400 uppercase">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
        <div className="mt-12">
          {children}
        </div>
      </div>
    </main>
  );
}
