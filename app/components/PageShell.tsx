import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  description,
  centered = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  centered?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#080914] px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-8 md:px-8 md:py-16">
      <div className={`mx-auto max-w-5xl ${centered ? "text-center" : ""}`}>
        <div className="mb-8 md:mb-12">
          {eyebrow ? (
            <p className="mb-2 text-sm font-bold tracking-wider text-violet-400 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className={`mt-4 text-base leading-relaxed text-slate-400 md:mt-6 md:text-lg ${centered ? "mx-auto max-w-2xl" : ""}`}>
            {description}
          </p>
        </div>
        <div className={`mt-8 md:mt-12 ${centered ? "flex flex-col items-center" : ""}`}>
          {children}
        </div>
      </div>
    </main>
  );
}
