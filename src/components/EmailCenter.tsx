import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Mail, Send, Inbox, Archive } from "lucide-react";

export function EmailCenter() {
  const emails = [
    {
      from: "gsd@insurance.com",
      subject: "Re: Claim OUT7618737 - Additional Info",
      preview: "Thank you for your query. The approval code has been issued...",
      date: "Today 2:15 PM",
      status: "unread",
      claimId: "OUT7618737",
    },
    {
      from: "claims@hospital.com",
      subject: "Query: Missing Documentation",
      preview: "We need additional documentation for claim OUT7561407...",
      date: "Today 10:30 AM",
      status: "read",
      claimId: "OUT7561407",
    },
    {
      from: "doctor@hospital.com",
      subject: "Medical Records Request",
      preview: "Attached are the requested medical records for patient...",
      date: "Yesterday",
      status: "read",
      claimId: "OUT7592388",
    },
    {
      from: "patient@email.com",
      subject: "Claim Status Inquiry",
      preview: "I would like to know the status of my claim...",
      date: "2 days ago",
      status: "unread",
      claimId: "OUT7234512",
    },
  ];

  const stats = [
    { label: "Inbox", value: "12", icon: Inbox },
    { label: "Sent", value: "45", icon: Send },
    { label: "Unread", value: "3", icon: Mail },
    { label: "Archived", value: "128", icon: Archive },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1>Email Center</h1>
        <p className="text-gray-500">Manage all claim-related communications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                    <div className="text-2xl">{stat.value}</div>
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Email List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Emails</CardTitle>
            <Button size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Compose
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Claim ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email, index) => (
                <TableRow
                  key={index}
                  className={email.status === "unread" ? "bg-blue-50" : ""}
                >
                  <TableCell>{email.from}</TableCell>
                  <TableCell>
                    <div>
                      <div className={email.status === "unread" ? "" : "text-gray-600"}>
                        {email.subject}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {email.preview}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{email.claimId}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{email.date}</TableCell>
                  <TableCell>
                    {email.status === "unread" && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Unread
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
