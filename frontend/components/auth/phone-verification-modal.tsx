"use client";

import React from "react";
import { Dialog } from "../ui/dialog";
import { VerifyPhoneForm } from "./verify-phone-form";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
}: PhoneVerificationModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Phone Number"
      description="Phone verification is required to place orders or list books for sale."
    >
      <VerifyPhoneForm onSuccess={onClose} />
    </Dialog>
  );
}
