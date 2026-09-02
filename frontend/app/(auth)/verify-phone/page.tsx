import { VerifyPhoneForm } from "../../../components/auth/verify-phone-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Verify Phone Number | Online Book Store",
  description: "Verify your phone number to access all features",
};

export default function VerifyPhonePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Phone Verification
          </CardTitle>
          <CardDescription>
            Verify your mobile number to list books and confirm purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyPhoneForm />
        </CardContent>
      </Card>
    </main>
  );
}
