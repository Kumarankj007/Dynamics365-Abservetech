/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { GraduationCap } from "lucide-react";
import UseLoadingRouter from "../hooks/useLoadRoute";
import { useAuthStore } from "../store/authStore";
import { useCustomMutation } from "../hooks/useCustomMutation";

interface BecomeInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BecomeInstructorModal = ({
  isOpen,
  onClose,
}: BecomeInstructorModalProps) => {
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const { userData, switchRole } = useAuthStore((state) => state);
  const router = UseLoadingRouter();

  const apiCall = async (data: any) => {
    return switchRole(data);
  };
  const { trigger } = useCustomMutation(apiCall, {
    onSuccessCallback() {
      router?.push(
        userData?.currentRole == "Instructor" ? "/instructor/dashboard" : "/"
      );
    },
  });
  
  const handleConfirm = () => {
    if (userData?.currentRole == "User") {
      if (isAgreedToTerms) {
        trigger({ newRole: "Instructor" });
        onClose();
      }
    } else if (userData?.currentRole == "Instructor") {
      trigger({ newRole: "User" });
      onClose();
    }
  };

  const handleClose = () => {
    setIsAgreedToTerms(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-background border border-border">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {userData?.currentRole == "Instructor"
              ? "Become an Student"
              : "Become an Instructor"}
          </DialogTitle>
          {userData?.currentRole == "User" && (
            <DialogDescription className="text-muted-foreground leading-relaxed">
              Ready to share your expertise? As an instructor, you&apos;ll be
              able to create courses, manage students, and earn from your
              knowledge. This will give you access to our instructor dashboard
              and tools.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {userData?.currentRole == "User" && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={isAgreedToTerms}
                onCheckedChange={(checked: boolean) =>
                  setIsAgreedToTerms(checked as boolean)
                }
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-5 cursor-pointer"
              >
                I agree to the instructor terms and conditions, and understand
                my responsibilities as a course creator on this platform.
              </label>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={userData?.currentRole == "User" ? !isAgreedToTerms : false}
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
            >
              Confirm & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeInstructorModal;
