"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Phone, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/auth-context";
import {
  useRequestVerificationMutation,
  useVerifyPhoneMutation,
} from "../../hooks/use-auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const phoneSchema = z.object({
  phoneNo: z
    .string()
    .min(7, "Please enter a valid phone number")
    .regex(/^[0-9+\s-]{7,15}$/, "Invalid phone number format"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(4, "OTP code must be at least 4 digits")
    .max(6, "OTP code cannot exceed 6 digits"),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

interface VerifyPhoneFormProps {
  onSuccess?: () => void;
}

export function VerifyPhoneForm({ onSuccess }: VerifyPhoneFormProps) {
  const { user } = useAuth();
  const requestMutation = useRequestVerificationMutation();
  const verifyMutation = useVerifyPhoneMutation();

  const [step, setStep] = useState<"request" | "verify">(
    user?.phoneNo ? "verify" : "request"
  );
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNo: user?.phoneNo || "",
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleRequestOtp = (data: PhoneFormValues) => {
    setInfoMsg(null);
    requestMutation.mutate(
      { phoneNo: data.phoneNo },
      {
        onSuccess: (res) => {
          setInfoMsg(
            res.message || "OTP verification code sent to your phone number."
          );
          setStep("verify");
        },
      }
    );
  };

  const handleVerifyOtp = (data: OtpFormValues) => {
    setInfoMsg(null);
    const currentPhone = phoneForm.getValues("phoneNo") || user?.phoneNo || "";
    verifyMutation.mutate(
      { phoneNo: currentPhone, otp: data.otp },
      {
        onSuccess: () => {
          setInfoMsg("Phone number verified successfully!");
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  if (user?.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Phone Verified
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your account is fully verified. You can now sell books and place orders seamlessly.
        </p>
      </div>
    );
  }

  const activeError =
    (requestMutation.error as any)?.response?.data?.message ||
    (requestMutation.error as any)?.message ||
    (verifyMutation.error as any)?.response?.data?.message ||
    (verifyMutation.error as any)?.message ||
    null;

  return (
    <div className="space-y-4">
      {activeError && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p>{activeError}</p>
        </div>
      )}

      {infoMsg && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p>{infoMsg}</p>
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={phoneForm.handleSubmit(handleRequestOtp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                className="pl-10"
                error={phoneForm.formState.errors.phoneNo?.message}
                {...phoneForm.register("phoneNo")}
              />
            </div>
            <p className="text-xs text-slate-500">
              We will send a one-time OTP verification code to this phone number.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={requestMutation.isPending}
          >
            Send Verification Code
          </Button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP Code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                className="pl-10 tracking-widest font-mono text-lg"
                error={otpForm.formState.errors.otp?.message}
                {...otpForm.register("otp")}
              />
            </div>
            <p className="text-xs text-slate-500">
              Enter the OTP sent to <span className="font-semibold">{phoneForm.getValues("phoneNo") || user?.phoneNo}</span>.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("request")}
              disabled={verifyMutation.isPending}
              className="w-1/3"
            >
              Change Phone
            </Button>
            <Button
              type="submit"
              className="w-2/3"
              isLoading={verifyMutation.isPending}
            >
              Verify OTP
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

