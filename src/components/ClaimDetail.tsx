import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  FileText,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import type { Claim } from "./ClaimsTable";

interface ClaimDetailProps {
  claim: Claim;
  onBack: () => void;
}

interface ChecklistItem {
  name: string;
  status: "passed" | "failed" | "pending";
  action?: string;
}

export function ClaimDetail({ claim, onBack }: ClaimDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowConfidence, setShowLowConfidence] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "pending":
      case "pending gsd review":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "query raised":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Mock data for checklists
  const claimFormChecklist: ChecklistItem[] = [
    { name: "EMR and Final Dx filled", status: "passed" },
    { name: "Doctor name & license present", status: "passed" },
    { name: "Diagnosis requiring approval", status: "failed", action: "Missing approval code" },
    { name: "Admission status recorded", status: "passed" },
  ];

  const invoiceChecklist: ChecklistItem[] = [
    { name: "Invoice total matches approval", status: "failed", action: "Amount mismatch" },
    { name: "Duplicate services", status: "passed" },
    { name: "Discounts verified", status: "passed" },
  ];

  const approvalChecklist: ChecklistItem[] = [
    { name: "Approval document present", status: "passed" },
    { name: "Partial approvals", status: "failed", action: "Check partial amounts" },
    { name: "Threshold verified", status: "passed" },
  ];

  const invoiceItems = [
    { code: "LAB001", service: "Complete Blood Count", qty: 1, gross: "150.00", approved: "150.00", guestShare: "30.00" },
    { code: "RAD002", service: "Chest X-Ray", qty: 1, gross: "300.00", approved: "300.00", guestShare: "60.00" },
    { code: "CONS01", service: "Consultation - Emergency", qty: 1, gross: "500.00", approved: "450.00", guestShare: "90.00" },
    { code: "MED003", service: "Medication - Antibiotics", qty: 2, gross: "200.00", approved: "200.00", guestShare: "40.00" },
  ];

  const approvedItems = [
    { code: "CONS01", description: "Emergency Consultation", estAmt: "500.00", approvedAmt: "450.00", remarks: "Standard rate applied" },
    { code: "LAB001", description: "Lab Tests", estAmt: "200.00", approvedAmt: "150.00", remarks: "Covered under policy" },
    { code: "RAD002", description: "Radiology", estAmt: "300.00", approvedAmt: "300.00", remarks: "Approved" },
  ];

  const emailLog = [
    { to: "gsd@insurance.com", cc: "claims@hospital.com", subject: "Query: Missing Approval Code", status: "Sent", date: "22/07/2025" },
    { to: "doctor@hospital.com", cc: "", subject: "Request: Additional Documentation", status: "Pending", date: "21/07/2025" },
    { to: "patient@email.com", cc: "", subject: "Claim Status Update", status: "Sent", date: "20/07/2025" },
  ];

  const renderChecklistItem = (item: ChecklistItem, index: number) => (
    <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
      <div className="flex items-start gap-3">
        {item.status === "passed" ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        ) : item.status === "failed" ? (
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        )}
        <div>
          <div className="text-sm">{item.name}</div>
          {item.action && (
            <div className="text-sm text-red-600 mt-1">{item.action}</div>
          )}
        </div>
      </div>
      {item.status === "failed" && (
        <Button variant="outline" size="sm">Raise Query</Button>
      )}
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b shrink-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6 flex-1">
              <div>
                <div className="text-sm text-gray-500">Claim ID</div>
                <div>{claim.id}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500">Patient Name</div>
                <div>{claim.patientName}</div>
              </div>
              <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search in claim details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Tabs Content */}
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="claim-form" className="p-6">
            <TabsList className="mb-6">
              <TabsTrigger value="claim-form">Claim Form</TabsTrigger>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            {/* Claim Form Tab */}
            <TabsContent value="claim-form" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">DOB</div>
                      <div className="text-sm">15/03/1985</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gender</div>
                      <div className="text-sm">Female</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">QID</div>
                      <div className="text-sm">28503156789</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Doctor</div>
                      <div className="text-sm">{claim.doctor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Department</div>
                      <div className="text-sm">{claim.department}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Diagnosis</div>
                      <div className="text-sm">Acute Respiratory Infection</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit Date</div>
                      <div className="text-sm">{claim.uploadedOn}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Policy No</div>
                      <div className="text-sm">POL-2024-00123</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Insurer</div>
                      <div className="text-sm">BUPA Arabia</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Claim Form Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {claimFormChecklist.map((item, index) => renderChecklistItem(item, index))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoice Tab */}
            <TabsContent value="invoice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Invoice No</div>
                      <div className="text-sm">INV-2025-00456</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="text-sm">{claim.uploadedOn}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gross</div>
                      <div className="text-sm">SAR 1,150.00</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Company Share</div>
                      <div className="text-sm">SAR 920.00</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Patient Share</div>
                      <div className="text-sm">SAR 230.00</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead>Guest Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.service}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>SAR {item.gross}</TableCell>
                          <TableCell>SAR {item.approved}</TableCell>
                          <TableCell>SAR {item.guestShare}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoiceChecklist.map((item, index) => renderChecklistItem(item, index))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approval Tab */}
            <TabsContent value="approval" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Approval Code</div>
                      <div className="text-sm">APP-2025-789</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="text-sm">20/07/2025</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="text-sm">Partial Approval</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Approved Amount</div>
                      <div className="text-sm">SAR 900.00</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Diagnosis</div>
                      <div className="text-sm">J06.9</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approved Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Est Amt</TableHead>
                        <TableHead>Approved Amt</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>SAR {item.estAmt}</TableCell>
                          <TableCell>SAR {item.approvedAmt}</TableCell>
                          <TableCell>{item.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {approvalChecklist.map((item, index) => renderChecklistItem(item, index))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unified Checklist Tab */}
            <TabsContent value="checklist" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Form Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {claimFormChecklist.map((item, index) => renderChecklistItem(item, index))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Approval Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {approvalChecklist.map((item, index) => renderChecklistItem(item, index))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {invoiceChecklist.map((item, index) => renderChecklistItem(item, index))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investigation Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {renderChecklistItem({ name: "Lab results attached", status: "passed" }, 0)}
                    {renderChecklistItem({ name: "Imaging reports verified", status: "passed" }, 1)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Emails Tab */}
            <TabsContent value="emails" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>To</TableHead>
                        <TableHead>CC</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLog.map((email, index) => (
                        <TableRow key={index}>
                          <TableCell>{email.to}</TableCell>
                          <TableCell>{email.cc || "-"}</TableCell>
                          <TableCell>{email.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={email.status === "Sent" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                              {email.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{email.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Thread Viewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div>From: claims@hospital.com</div>
                        <div className="text-sm text-gray-500">22/07/2025 10:30 AM</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Dear GSD Team, we are missing the approval code for claim {claim.id}. Please provide the authorization details.
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex justify-between mb-2">
                        <div>From: gsd@insurance.com</div>
                        <div className="text-sm text-gray-500">22/07/2025 2:15 PM</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Approval code APP-2025-789 has been issued. Please note this is a partial approval.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Document Viewer Sidebar */}
        <div className="w-96 border-l bg-white overflow-auto">
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              <h3>Document Viewer</h3>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Claim Form PDF</span>
                </div>
                <div className="h-48 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <div className="text-sm">PDF Preview</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Invoice PDF</span>
                </div>
                <div className="h-48 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <div className="text-sm">PDF Preview</div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Approval PDF</span>
                </div>
                <div className="h-48 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <div className="text-sm">PDF Preview</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="low-confidence" className="text-sm">Show Low Confidence Fields</Label>
                <Switch
                  id="low-confidence"
                  checked={showLowConfidence}
                  onCheckedChange={setShowLowConfidence}
                />
              </div>

              <Button variant="outline" className="w-full">
                Mark as Verified
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Re-run AI Validation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Summary & Actions */}
      <div className="bg-white border-t shrink-0">
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Checklist Completion</span>
              <span>70% Complete</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Claim Form</div>
                <Progress value={75} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">3/4 passed</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Approval</div>
                <Progress value={66} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">2/3 passed</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Invoice</div>
                <Progress value={66} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">2/3 passed</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Investigation</div>
                <Progress value={100} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">2/2 passed</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Suggestions */}
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm mb-2">AI Suggestions</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Check partial approvals vs invoice total</li>
                    <li>• Send query to GSD for missing info</li>
                    <li>• Flag claim for reapproval follow-up</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-end">
              <Button variant="outline">Save</Button>
              <Button variant="default">Submit</Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Revalidate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
