"use client";

import { FormEvent, useEffect, useState } from "react";

export function LoginClient() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        const session = data as { authenticated: boolean };
        if (session.authenticated) {
          window.location.replace("/admin");
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(
        data?.error === "ADMIN_PASSWORD is not configured"
          ? "서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다."
          : "아이디 또는 비밀번호가 올바르지 않습니다.",
      );
      return;
    }

    window.location.replace("/admin");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30"
    >
      <h2 className="text-2xl font-bold text-white">관리자 로그인</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        관리자 페이지는 로그인한 사용자만 접근할 수 있습니다.
      </p>
      <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="username">
        아이디
      </label>
      <input
        id="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 focus:ring-4"
      />
      <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="password">
        비밀번호
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-pink-300/40 focus:ring-4"
      />
      {message ? (
        <p className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500 px-5 py-4 font-bold text-white transition enabled:hover:scale-[1.01] disabled:opacity-50"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}

