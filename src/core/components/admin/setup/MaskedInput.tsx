import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaskedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function MaskedInput({ label, value, onChange, placeholder, multiline = false }: MaskedInputProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealTimer, setRevealTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleReveal = () => {
    setIsRevealed(true);
    
    // Clear existing timer
    if (revealTimer) {
      clearTimeout(revealTimer);
    }
    
    // Set new timer to hide after 10 seconds
    const timer = setTimeout(() => {
      setIsRevealed(false);
    }, 10000);
    
    setRevealTimer(timer);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
    };
  }, [revealTimer]);

  const displayValue = isRevealed ? value : '•'.repeat(Math.min(value.length, 20));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {multiline ? (
          <Textarea
            value={displayValue}
            onChange={(e) => isRevealed && onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono pr-20"
            readOnly={!isRevealed}
            rows={4}
          />
        ) : (
          <Input
            type={isRevealed ? "text" : "password"}
            value={displayValue}
            onChange={(e) => isRevealed && onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono pr-20"
            readOnly={!isRevealed}
          />
        )}
        
        <div className="absolute right-2 top-2 flex space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleReveal}
            disabled={isRevealed}
          >
            {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCopy}
            disabled={!value}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}