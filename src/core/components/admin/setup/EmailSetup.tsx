import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff, Copy, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MaskedInput } from "./MaskedInput";
import { TestEmailModal } from "./TestEmailModal";

interface EmailSetupProps {
  onChanged: () => void;
}

export function EmailSetup({ onChanged }: EmailSetupProps) {
  const { toast } = useToast();
  const [showTestModal, setShowTestModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  const [config, setConfig] = useState({
    smtpType: "standard",
    smtpHost: "",
    smtpPort: "587",
    encryption: "starttls",
    authUser: "",
    authPassword: "",
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    securityGridKey: "",
    dkimSelector: "",
    dkimPrivateKey: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    onChanged();
  };

  const validateConnection = async () => {
    setConnectionStatus('testing');
    // Mock validation
    setTimeout(() => {
      const isValid = config.smtpHost && config.smtpPort && config.authUser && config.authPassword;
      setConnectionStatus(isValid ? 'success' : 'error');
      toast({
        title: isValid ? "Connection successful" : "Connection failed",
        description: isValid ? "SMTP configuration is valid" : "Please check your credentials",
        variant: isValid ? "default" : "destructive"
      });
    }, 2000);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SMTP Configuration
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateConnection}
                disabled={connectionStatus === 'testing'}
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Validate Connection'}
                {connectionStatus === 'success' && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowTestModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpType">SMTP Type</Label>
                <Select value={config.smtpType} onValueChange={(value) => handleInputChange('smtpType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard SMTP</SelectItem>
                    <SelectItem value="office365">Microsoft 365 (OAuth later)</SelectItem>
                    <SelectItem value="gmail">Gmail SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtpHost}
                    onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                  <p className="text-xs text-gray-500">25 / 465 / 587</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Encryption</Label>
                <RadioGroup 
                  value={config.encryption} 
                  onValueChange={(value) => handleInputChange('encryption', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="starttls" id="starttls" />
                    <Label htmlFor="starttls">STARTTLS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ssl" id="ssl" />
                    <Label htmlFor="ssl">SSL/TLS</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500">Use STARTTLS on 587 for most providers.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authUser">Auth User</Label>
                <Input
                  id="authUser"
                  type="email"
                  value={config.authUser}
                  onChange={(e) => handleInputChange('authUser', e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <MaskedInput
                label="Auth Password"
                value={config.authPassword}
                onChange={(value) => handleInputChange('authPassword', value)}
                placeholder="Enter password"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={config.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Your Company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={config.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyToEmail">Reply-To Email (Optional)</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  value={config.replyToEmail}
                  onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <MaskedInput
                label="Security Grid Key"
                value={config.securityGridKey}
                onChange={(value) => handleInputChange('securityGridKey', value)}
                placeholder="Enter security key"
              />

              <div className="space-y-2">
                <Label htmlFor="dkimSelector">DKIM Selector (Optional)</Label>
                <Input
                  id="dkimSelector"
                  value={config.dkimSelector}
                  onChange={(e) => handleInputChange('dkimSelector', e.target.value)}
                  placeholder="default"
                />
              </div>

              <MaskedInput
                label="DKIM Private Key (Optional)"
                value={config.dkimPrivateKey}
                onChange={(value) => handleInputChange('dkimPrivateKey', value)}
                placeholder="Enter DKIM private key"
                multiline
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <TestEmailModal 
        open={showTestModal}
        onOpenChange={setShowTestModal}
      />
    </>
  );
}