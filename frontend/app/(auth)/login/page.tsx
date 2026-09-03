import { LoginForm } from "../../../components/auth/login-form";

export const metadata = {
  title: "Login | Online Book Store",
  description: "Sign in to your online book store account",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <LoginForm />
    </main>
  );
}
