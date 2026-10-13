"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";

const Help = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-2">Get help and find answers to common questions</p>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              For questions, technical support, or course-related inquiries, please contact us:
            </p>
            <div className="inline-flex items-center justify-center px-4 py-2 bg-secondary rounded-lg">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium text-foreground">contact@dynamics365lab.com</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground">How do I access my courses?</h4>
                <p className="text-sm text-muted-foreground">Navigate to &quot;My Courses&quot; to view all your enrolled courses and track your progress.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">What&apos;s the difference between Lifetime and Subscription courses?</h4>
                <p className="text-sm text-muted-foreground">Lifetime courses never expire, while subscription courses require active payment to maintain access.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">How do I cancel a subscription?</h4>
                <p className="text-sm text-muted-foreground">Go to the Subscriptions tab and click the &quot;Cancel&quot; button next to the subscription you want to cancel.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground">Course Materials</h4>
                <p className="text-sm text-muted-foreground">Download course materials and resources from within each course.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">System Requirements</h4>
                <p className="text-sm text-muted-foreground">Ensure your system meets the minimum requirements for the best learning experience.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Technical Support</h4>
                <p className="text-sm text-muted-foreground">Contact our technical team for any platform-related issues or questions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;