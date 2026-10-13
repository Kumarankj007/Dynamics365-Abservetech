import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { Badge } from "@/core/components/ui/badge";
import { 
  Search, 
  Send, 
  MessageCircle,
  User,
  Clock
} from "lucide-react";

interface Message {
  id: number;
  sender: string;
  senderType: 'student' | 'admin';
  subject: string;
  message: string;
  course: string;
  timestamp: string;
  isRead: boolean;
  isReplied: boolean;
}

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Mock messages data
  const messages: Message[] = [
    {
      id: 1,
      sender: "Alice Johnson",
      senderType: 'student',
      subject: "Question about Module 3",
      message: "Hi, I'm having trouble understanding the Power Platform integration part in Module 3. Could you provide more clarity on the connection setup?",
      course: "Dynamics 365 Fundamentals",
      timestamp: "2 hours ago",
      isRead: false,
      isReplied: false
    },
    {
      id: 2,
      sender: "Admin Support",
      senderType: 'admin',
      subject: "Course Review Complete",
      message: "Your course 'Advanced Power BI' has been reviewed and approved. It's now live on the platform.",
      course: "Advanced Power BI",
      timestamp: "1 day ago",
      isRead: true,
      isReplied: false
    },
    {
      id: 3,
      sender: "Mike Chen",
      senderType: 'student',
      subject: "Assignment Submission Issue",
      message: "I'm unable to submit my assignment for the final module. The upload button seems to be not working.",
      course: "Power Platform Developer",
      timestamp: "3 days ago",
      isRead: true,
      isReplied: true
    }
  ];

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = () => {
    if (replyMessage.trim() && selectedMessage) {
      // console.log('Sending reply:', replyMessage);
      setReplyMessage("");
      // Update message as replied
      if (selectedMessage) {
        selectedMessage.isReplied = true;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with your students and receive updates from admin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Inbox ({messages.filter(m => !m.isRead).length} unread)
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-muted' : ''
                    } ${!message.isRead ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{message.sender}</span>
                        <Badge variant={message.senderType === 'admin' ? 'default' : 'secondary'}>
                          {message.senderType}
                        </Badge>
                      </div>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {message.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{message.course}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{message.timestamp}</span>
                      </div>
                    </div>
                    {message.isReplied && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Replied
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        From: {selectedMessage.sender}
                      </span>
                      <Badge variant={selectedMessage.senderType === 'admin' ? 'default' : 'secondary'}>
                        {selectedMessage.senderType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Course: {selectedMessage.course} • {selectedMessage.timestamp}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>

                {/* Reply Section */}
                <div className="space-y-3">
                  <h4 className="font-medium">Reply</h4>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;