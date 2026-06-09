import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  centered = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#080914] px-6 py-16 sm:px-8">
      <div className={`mx-auto max-w-5xl ${centered ? "text-center" : ""}`}>
        <div className="mb-12">
          <p className="mb-2 text-sm font-bold tracking-wider text-violet-400 uppercase">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className={`mt-6 text-lg leading-relaxed text-slate-400 ${centered ? "mx-auto max-w-2xl" : ""}`}>
            {description}
          </p>
        </div>
        <div className={`mt-12 ${centered ? "flex flex-col items-center" : ""}`}>
          {children}
        </div>
      </div>
    </main>
  );
}
