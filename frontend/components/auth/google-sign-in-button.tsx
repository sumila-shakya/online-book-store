"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useGoogleAuthMutation } from "../../hooks/use-auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccessRedirect?: string;
}

export function GoogleSignInButton({ onSuccessRedirect = "/" }: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleAuthMutation = useGoogleAuthMutation();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "718776397265-siso0figdrjog6seu8fk4el0h0r3phqg.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setError("Google authentication failed. No credential received.");
      return;
    }

    setError(null);
    try {
      const res = await googleAuthMutation.mutateAsync(response.credential);
      if (res.success) {
        router.push(onSuccessRedirect);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Google sign in failed.";
      setError(msg);
    }
  };

  useEffect(() => {
    if (scriptLoaded && window.google && buttonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        // Render official Google button
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        });
      } catch (err) {
        console.error("Error initializing Google Identity Services:", err);
      }
    }
  }, [scriptLoaded, clientId]);

  return (
    <div className="w-full space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setScriptLoaded(true)}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {googleAuthMutation.isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-full">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          </div>
        )}

        <div ref={buttonRef} className="flex justify-center min-h-[44px] w-full" />
      </div>
    </div>
  );
}
