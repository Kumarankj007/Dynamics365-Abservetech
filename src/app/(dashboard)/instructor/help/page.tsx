"use client"
import { Card, CardContent } from "@/core/components/ui/card";
import { Mail } from "lucide-react";

const Help = () => {
  return (
    <div className="space-y-8 bg-background">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Help & Support</h2>
        <p className="text-muted-foreground">Get assistance with your instructor account</p>
      </div>

      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Need Help?</h3>
              <p className="text-muted-foreground">
                For questions, please reach out to{" "}
                <a 
                  href="mailto:contact@dynamics365lab.com" 
                  className="text-primary hover:underline font-medium"
                >
                  contact@dynamics365lab.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;