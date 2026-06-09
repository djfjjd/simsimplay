import { PageShell } from "../components/PageShell";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Admin Login"
      title="관리자 전용 로그인"
      description="아이디는 admin, 비밀번호는 서버 환경변수 ADMIN_PASSWORD로 검증합니다."
    >
      <LoginClient />
    </PageShell>
  );
}

