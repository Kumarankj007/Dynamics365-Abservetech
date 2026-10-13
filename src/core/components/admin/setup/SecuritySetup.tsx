import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MaskedInput } from "./MaskedInput";

interface SecuritySetupProps {
  onChanged: () => void;
}

export function SecuritySetup({ onChanged }: SecuritySetupProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const [config, setConfig] = useState({
    jwtSecret: "",
    recaptchaSiteKey: "",
    recaptchaSecretKey: "",
    allowedDomains: ["localhost:3000", "yourdomain.com"],
    passwordPolicy: "standard",
    sessionTimeout: "60",
    maintenanceMode: false,
    securityGridKey: "",
    ipAllowlist: ""
  });

  const handleInputChange = (field: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    onChanged();
  };

  const handleDomainAdd = (domain: string) => {
    if (domain && !config.allowedDomains.includes(domain)) {
      handleInputChange('allowedDomains', [...config.allowedDomains, domain]);
    }
  };

  const handleDomainRemove = (domain: string) => {
    handleInputChange('allowedDomains', config.allowedDomains.filter(d => d !== domain));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Security & Platform Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <MaskedInput
              label="JWT Signing Secret"
              value={config.jwtSecret}
              onChange={(value) => handleInputChange('jwtSecret', value)}
              placeholder="Enter JWT secret"
            />

            <div className="space-y-2">
              <Label>reCAPTCHA Site Key</Label>
              <Input
                value={config.recaptchaSiteKey}
                onChange={(e) => handleInputChange('recaptchaSiteKey', e.target.value)}
                placeholder="6LfOYyoqAAAAAG..."
                className="font-mono"
              />
            </div>

            <MaskedInput
              label="reCAPTCHA Secret Key"
              value={config.recaptchaSecretKey}
              onChange={(value) => handleInputChange('recaptchaSecretKey', value)}
              placeholder="Enter reCAPTCHA secret"
            />

            <div className="space-y-2">
              <Label>Password Policy</Label>
              <Select value={config.passwordPolicy} onValueChange={(value) => handleInputChange('passwordPolicy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {config.passwordPolicy === 'relaxed' && 'Minimum 6 characters'}
                {config.passwordPolicy === 'standard' && 'Minimum 8 characters, mixed case'}
                {config.passwordPolicy === 'strict' && 'Minimum 12 characters, mixed case, numbers, symbols'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Allowed Domains / CORS</Label>
              <div className="space-y-2">
                {config.allowedDomains.map((domain, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={domain} readOnly className="text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDomainRemove(domain)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add domain"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleDomainAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Add domains allowed to call APIs/embeds.</p>
            </div>

            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                placeholder="60"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Shows a friendly maintenance page to visitors; admins can still access.</p>
              </div>
              <Switch
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
            </div>
          </div>
        </div>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-0">
              {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Advanced Settings</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <MaskedInput
              label="Security Grid Key"
              value={config.securityGridKey}
              onChange={(value) => handleInputChange('securityGridKey', value)}
              placeholder="Enter security grid key"
            />

            <div className="space-y-2">
              <Label>IP Allowlist for Admin</Label>
              <Textarea
                value={config.ipAllowlist}
                onChange={(e) => handleInputChange('ipAllowlist', e.target.value)}
                placeholder="192.168.1.1&#10;10.0.0.0/8&#10;Leave empty to allow all IPs"
                rows={4}
              />
              <p className="text-xs text-gray-500">One IP address or CIDR block per line.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}