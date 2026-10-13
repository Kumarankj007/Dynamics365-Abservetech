import Login from "@/app/(frontend)/login/page";
import Signup from "@/app/(frontend)/signup/page";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/core/components/ui/dialog";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [login, setLogin] = useState(true);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-hero-bg border border-white/10 text-text-light p-0">
        <DialogTitle className="text-2xl text-center font-bold text-text-light mt-6">
          Create or login your account
        </DialogTitle>
        {login ? (
          <Login modal={true} setLogin={setLogin} onClose={onClose} />
        ) : (
          <Signup modal={true} setLogin={setLogin} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
