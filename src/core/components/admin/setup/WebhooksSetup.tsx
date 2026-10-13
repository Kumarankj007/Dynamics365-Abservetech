import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WebhooksSetup() {
  const { toast } = useToast();
  
  const webhookUrls = [
    { name: "Stripe Webhook URL", url: "/webhooks/stripe" },
    { name: "Razorpay Webhook URL", url: "/webhooks/razorpay" },
    { name: "PayPal Webhook URL", url: "/webhooks/paypal" },
    { name: "Email Bounce/Complaint", url: "/webhooks/email/provider" }
  ];

  const handleCopy = async (url: string, name: string) => {
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Copied to clipboard",
        description: `${name} has been copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Integration Endpoints</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {webhookUrls.map((webhook, index) => (
            <div key={index} className="space-y-2">
              <Label>{webhook.name}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${window.location.origin}${webhook.url}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(webhook.url, webhook.name)}
                  className="flex items-center space-x-1"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Setup Checklist</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-blue-800">Add the URL to your provider's dashboard.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-blue-800">Use the Signing Secret fields in Payments to verify signatures.</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-blue-800">Test webhook delivery after configuration.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium mb-2">Stripe Events</h5>
            <ul className="space-y-1 text-xs">
              <li>• payment_intent.succeeded</li>
              <li>• customer.subscription.created</li>
              <li>• invoice.payment_failed</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Razorpay Events</h5>
            <ul className="space-y-1 text-xs">
              <li>• payment.captured</li>
              <li>• payment.failed</li>
              <li>• subscription.charged</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}