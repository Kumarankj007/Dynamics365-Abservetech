import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaskedInput } from "./MaskedInput";

interface PaymentsSetupProps {
  onChanged: () => void;
}

export function PaymentsSetup({ onChanged }: PaymentsSetupProps) {
  const { toast } = useToast();
  
  const [stripe, setStripe] = useState({
    enabled: false,
    mode: "test",
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    status: 'not-configured' as 'not-configured' | 'configured' | 'testing'
  });

  const [razorpay, setRazorpay] = useState({
    enabled: false,
    mode: "test",
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    status: 'not-configured' as 'not-configured' | 'configured' | 'testing'
  });

  const [paypal, setPaypal] = useState({
    enabled: false,
    environment: "sandbox",
    clientId: "",
    clientSecret: "",
    merchantId: "",
    status: 'not-configured' as 'not-configured' | 'configured' | 'testing'
  });

  const testConnection = async (provider: 'stripe' | 'razorpay' | 'paypal') => {
    const configs = { stripe, razorpay, paypal };
    const setters = { stripe: setStripe, razorpay: setRazorpay, paypal: setPaypal };
    
    setters[provider](prev => ({ ...prev, status: 'testing' }));
    
    // Mock test connection
    setTimeout(() => {
      const isValid = Math.random() > 0.3; // 70% success rate for demo
      setters[provider](prev => ({ ...prev, status: isValid ? 'configured' : 'not-configured' }));
      
      toast({
        title: isValid ? "Connection successful" : "Connection failed",
        description: isValid ? `${provider} configuration is valid` : `Please check your ${provider} credentials`,
        variant: isValid ? "default" : "destructive"
      });
    }, 2000);
  };

  const handleStripeChange = (field: string, value: unknown) => {
    setStripe(prev => ({ ...prev, [field]: value }));
    onChanged();
  };

  const handleRazorpayChange = (field: string, value: unknown) => {
    setRazorpay(prev => ({ ...prev, [field]: value }));
    onChanged();
  };

  const handlePaypalChange = (field: string, value: unknown) => {
    setPaypal(prev => ({ ...prev, [field]: value }));
    onChanged();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-green-100 text-green-800">Configured</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
      default:
        return <Badge variant="secondary">Not configured</Badge>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Payment Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stripe" className="flex items-center space-x-2">
              <span>Stripe</span>
              {getStatusBadge(stripe.status)}
            </TabsTrigger>
            <TabsTrigger value="razorpay" className="flex items-center space-x-2">
              <span>Razorpay</span>
              {getStatusBadge(razorpay.status)}
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center space-x-2">
              <span>PayPal</span>
              {getStatusBadge(paypal.status)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stripe" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={stripe.enabled}
                  onCheckedChange={(checked) => handleStripeChange('enabled', checked)}
                />
                <Label>Enable Stripe</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection('stripe')}
                disabled={!stripe.enabled || stripe.status === 'testing'}
              >
                {stripe.status === 'testing' ? 'Testing...' : 'Test Connection'}
                {stripe.status === 'configured' && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
              </Button>
            </div>

            <div className={`space-y-4 ${!stripe.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex space-x-4">
                <Button
                  variant={stripe.mode === 'test' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStripeChange('mode', 'test')}
                >
                  Test
                </Button>
                <Button
                  variant={stripe.mode === 'live' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStripeChange('mode', 'live')}
                >
                  Live
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Publishable Key</Label>
                  <Input
                    value={stripe.publishableKey}
                    onChange={(e) => handleStripeChange('publishableKey', e.target.value)}
                    placeholder="pk_test_..."
                    className="font-mono"
                  />
                </div>

                <MaskedInput
                  label="Secret Key"
                  value={stripe.secretKey}
                  onChange={(value) => handleStripeChange('secretKey', value)}
                  placeholder="sk_test_..."
                />
              </div>

              <MaskedInput
                label="Webhook Signing Secret"
                value={stripe.webhookSecret}
                onChange={(value) => handleStripeChange('webhookSecret', value)}
                placeholder="whsec_..."
              />

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Use Test mode while integrating; switch to Live only after verification.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="razorpay" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={razorpay.enabled}
                  onCheckedChange={(checked) => handleRazorpayChange('enabled', checked)}
                />
                <Label>Enable Razorpay (India)</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection('razorpay')}
                disabled={!razorpay.enabled || razorpay.status === 'testing'}
              >
                {razorpay.status === 'testing' ? 'Testing...' : 'Test Connection'}
                {razorpay.status === 'configured' && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
              </Button>
            </div>

            <div className={`space-y-4 ${!razorpay.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex space-x-4">
                <Button
                  variant={razorpay.mode === 'test' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRazorpayChange('mode', 'test')}
                >
                  Test
                </Button>
                <Button
                  variant={razorpay.mode === 'live' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRazorpayChange('mode', 'live')}
                >
                  Live
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Key ID</Label>
                  <Input
                    value={razorpay.keyId}
                    onChange={(e) => handleRazorpayChange('keyId', e.target.value)}
                    placeholder="rzp_test_..."
                  />
                </div>

                <MaskedInput
                  label="Key Secret"
                  value={razorpay.keySecret}
                  onChange={(value) => handleRazorpayChange('keySecret', value)}
                  placeholder="Enter key secret"
                />
              </div>

              <MaskedInput
                label="Webhook Secret"
                value={razorpay.webhookSecret}
                onChange={(value) => handleRazorpayChange('webhookSecret', value)}
                placeholder="Enter webhook secret"
              />
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={paypal.enabled}
                  onCheckedChange={(checked) => handlePaypalChange('enabled', checked)}
                />
                <Label>Enable PayPal</Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection('paypal')}
                disabled={!paypal.enabled || paypal.status === 'testing'}
              >
                {paypal.status === 'testing' ? 'Testing...' : 'Test Connection'}
                {paypal.status === 'configured' && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
              </Button>
            </div>

            <div className={`space-y-4 ${!paypal.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex space-x-4">
                <Button
                  variant={paypal.environment === 'sandbox' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePaypalChange('environment', 'sandbox')}
                >
                  Sandbox
                </Button>
                <Button
                  variant={paypal.environment === 'live' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePaypalChange('environment', 'live')}
                >
                  Live
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    value={paypal.clientId}
                    onChange={(e) => handlePaypalChange('clientId', e.target.value)}
                    placeholder="AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztK7TEKlP4"
                    className="font-mono"
                  />
                </div>

                <MaskedInput
                  label="Client Secret"
                  value={paypal.clientSecret}
                  onChange={(value) => handlePaypalChange('clientSecret', value)}
                  placeholder="Enter client secret"
                />
              </div>

              <div className="space-y-2">
                <Label>Merchant ID (Optional)</Label>
                <Input
                  value={paypal.merchantId}
                  onChange={(e) => handlePaypalChange('merchantId', e.target.value)}
                  placeholder="Enter merchant ID"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}