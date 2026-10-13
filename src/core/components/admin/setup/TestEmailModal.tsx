import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TestEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEmailModal({ open, onOpenChange }: TestEmailModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Mock send test email
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Test email sent",
        description: `Test email sent successfully to ${email}`,
      });
      onOpenChange(false);
      setEmail("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">To:</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTest} disabled={isSending}>
              {isSending ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}