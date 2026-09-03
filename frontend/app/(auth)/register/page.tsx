import { RegisterForm } from "../../../components/auth/register-form";

export const metadata = {
  title: "Register | Online Book Store",
  description: "Create a new account on online book store",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <RegisterForm />
    </main>
  );
}
