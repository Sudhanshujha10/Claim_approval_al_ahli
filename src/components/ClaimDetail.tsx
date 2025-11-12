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
  Lightbulb,
  RefreshCw
} from "lucide-react";
import type { Claim } from "./ClaimsTable";
import { EmailComposerModal } from "./EmailComposerModal";

interface ClaimDetailProps {
  claim: Claim;
  onBack: () => void;
  onClaimApproved?: (claimId: string) => void;
}

interface ChecklistItem {
  name: string;
  status: "passed" | "failed" | "pending";
  action?: string;
}

export function ClaimDetail({ claim, onBack, onClaimApproved }: ClaimDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [localAiData, setLocalAiData] = useState((claim as any).aiData || {});
  const [isApproving, setIsApproving] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<any>(null);
  const [emailLog, setEmailLog] = useState<any[]>([]);

  // Extract AI data - use local state for real-time updates
  const aiData = localAiData;
  const claimData = aiData.Claim || {};
  const invoiceData = aiData.Invoice || {};
  const approvalData = aiData.Approval || {};
  const checklistData = aiData.Checklist || {};

  // Generate search suggestions based on claim data
  const generateSearchSuggestions = (query: string) => {
    if (!query.trim()) return [];
    
    const searchableFields = [
      // Claim data
      claimData.patientName,
      claimData.guestFileNo,
      claimData.qid,
      claimData.memberNo,
      claimData.doctor,
      claimData.department,
      claimData.diagnosis,
      claimData.chiefComplaint,
      claimData.insuranceCompany,
      claimData.planName,
      // Invoice data
      invoiceData.invoiceNo,
      invoiceData.totalAmount,
      invoiceData.approvedAmount,
      // Approval data
      approvalData.preApprovalCode,
      approvalData.approvalStatus,
      // Other fields
      claim.id,
      claim.patientName,
      claim.doctor,
      claim.department,
      claim.status
    ].filter(Boolean);

    const suggestions = searchableFields
      .filter(field => field && field.toString().toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5); // Limit to 5 suggestions

    return [...new Set(suggestions)]; // Remove duplicates
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      const suggestions = generateSearchSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle raising query for failed checklist item
  const handleRaiseQuery = (checklistItem: any) => {
    setSelectedChecklistItem(checklistItem);
    setEmailModalOpen(true);
  };

  // Handle email sent callback
  const handleEmailSent = (emailRecord: any) => {
    setEmailLog(prev => [emailRecord, ...prev]);
  };

  // Re-run AI validation
  async function handleRevalidate() {
    setIsRevalidating(true);
    try {
      const response = await fetch('https://claim-approval-al-ahli-1.onrender.com/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id })
      });
      const data = await response.json();
      if (data.ok) {
        setLocalAiData(data.aiData);
        alert('Validation re-run successfully!');
      } else {
        alert('Revalidation failed: ' + data.error);
      }
    } catch (e: any) {
      console.error('Revalidation error:', e);
      alert('Error re-running validation');
    } finally {
      setIsRevalidating(false);
    }
  }

  // Update checklist item manually
  function handleChecklistUpdate(checklistId: string, newStatus: string) {
    alert("Update coming soon");
  }

  // Approve claim
  async function handleApproveClaim() {
    setIsApproving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://claim-approval-al-ahli-1.onrender.com";
      const response = await fetch(`${baseUrl}/api/approve-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id })
      });
      const data = await response.json();
      if (data.ok) {
        alert('Claim approved successfully!');
        // Update the claim status in parent component
        if (onClaimApproved) {
          onClaimApproved(claim.id);
        }
        // Go back to dashboard
        onBack();
      } else {
        alert('Approval failed: ' + data.error);
      }
    } catch (e: any) {
      console.error('Approve error:', e);
      alert('Error approving claim');
    } finally {
      setIsApproving(false);
    }
  }

  // Calculate checklist statistics
  function calculateChecklistStats(category: any[]) {
    if (!category || !Array.isArray(category)) return { passed: 0, total: 0, percentage: 0 };
    const total = category.length;
    const passed = category.filter(item => item.status?.toLowerCase() === 'pass').length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { passed, total, percentage };
  }

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

  // Use checklist data directly (no conversion needed - preserve all AI fields)
  const claimFormChecklist = checklistData.ClaimForm || [];
  const invoiceChecklist = checklistData.Invoice || [];
  const approvalChecklist = checklistData.Approval || [];
  const investigationChecklist = checklistData.Investigation || [];

  // Extract invoice items from AI data
  const invoiceItems = (invoiceData.items || []).map((item: any) => ({
    no: item.no || "-",
    date: item.date || "-",
    code: item.code || "-",
    description: item.description || item.service || "-",
    qty: item.qty || item.quantity || "1.00",
    dv: item.dv || "-",
    ndv: item.ndv || "-",
    totalInvoice: item.totalInvoice || "-",
    guestShare: item.guestShare || "-",
    companyDiscount: item.companyDiscount || "-",
    companyShare: item.companyShare || "-"
  }));

  // Extract approval items from AI data
  const approvedItems = (approvalData.approvals || []).map((item: any) => ({
    code: item.code || "-",
    description: item.description || item.service || "-",
    qty: item.qty || item.quantity || "-",
    estAmt: item.estAmt || item.estimatedAmount || "0.00",
    apprAmt: item.apprAmt || item.approvedAmount || item.amount || "0.00",
    status: item.status || "Approved",
    remarks: item.remarks || "-"
  }));

  const mockEmailLog = [
    { to: "gsd@insurance.com", cc: "claims@hospital.com", subject: "Query: Missing Approval Code", status: "Sent", date: "22/07/2025" },
    { to: "doctor@hospital.com", cc: "", subject: "Request: Additional Documentation", status: "Pending", date: "21/07/2025" },
    { to: "patient@email.com", cc: "", subject: "Claim Status Update", status: "Sent", date: "20/07/2025" },
  ];

  const renderChecklistItem = (item: any, index: number) => {
    const confidence = item.confidence !== undefined ? item.confidence : 0.85;
    const isLowConfidence = confidence < 0.7;
    
    // Filter by low confidence toggle
    if (showLowConfidence && !isLowConfidence) {
      return null;
    }

    const status = item.status?.toLowerCase() || 'pending';
    const isManualOverride = item.manualOverride || false;

    return (
      <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-start gap-3 flex-1">
          {status === "pass" ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          ) : status === "fail" ? (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{item.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                confidence >= 0.9 ? 'bg-green-100 text-green-700' :
                confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Confidence {Math.round(confidence * 100)}%
              </span>
              {isManualOverride && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  Manual Override
                </span>
              )}
            </div>
            {item.reason && (
              <div className="text-xs text-gray-600 mt-1">{item.reason}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {status !== "pass" && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={() => handleChecklistUpdate(item.id, 'pass')}
            >
              Mark Pass
            </Button>
          )}
          {status !== "fail" && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={() => handleChecklistUpdate(item.id, 'fail')}
            >
              Mark Fail
            </Button>
          )}
          {status === "fail" && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => handleRaiseQuery(item)}
            >
              Raise Query
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 h-screen flex flex-col overflow-hidden overflow-x-hidden">
      {/* Fixed Top Header */}
      <div className="bg-white border-b shrink-0 overflow-x-hidden">
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
              <div className="flex-1 min-h-0 overflow-auto">
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
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(searchSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - More space for tabs */}
      <div className="flex-1 min-h-0 overflow-hidden max-w-full pb-4">
        {/* Full Width - Tabs Content with More Scrolling Space */}
        <div className="w-full h-full overflow-y-auto min-w-0 max-w-full">
          <Tabs defaultValue="claim-form" className="p-6 max-w-full h-full flex flex-col">
            <TabsList className="mb-6">
              <TabsTrigger value="claim-form">Claim Form</TabsTrigger>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            {/* Claim Form Tab */}
            <TabsContent value="claim-form" className="space-y-6 flex-1 overflow-y-auto pb-8 min-h-96">
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Guest Name</div>
                      <div className="text-sm font-medium">{claimData.patientName || claim.patientName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Guest File No</div>
                      <div className="text-sm">{claimData.guestFileNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">QID/Passport</div>
                      <div className="text-sm">{claimData.qid || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Member No</div>
                      <div className="text-sm">{claimData.memberNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">DOB</div>
                      <div className="text-sm">{claimData.dob || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gender</div>
                      <div className="text-sm">{claimData.gender || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tel No</div>
                      <div className="text-sm">{claimData.telNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Nationality</div>
                      <div className="text-sm">{claimData.nationality || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visit & Clinical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Visit Date</div>
                      <div className="text-sm">{claimData.visitDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit No</div>
                      <div className="text-sm">{claimData.claimId || claim.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Visit Type</div>
                      <div className="text-sm">{claimData.visitType || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Doctor</div>
                      <div className="text-sm">{claimData.doctor || claim.doctor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Department/Clinic</div>
                      <div className="text-sm">{claimData.department || claim.department}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Registered By</div>
                      <div className="text-sm">{claimData.registeredBy || "-"}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-gray-500">Diagnosis</div>
                      <div className="text-sm">{claimData.diagnosis || "-"}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-gray-500">Chief Complaint</div>
                      <div className="text-sm">{claimData.chiefComplaint || "-"}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-gray-500">Clinical Findings</div>
                      <div className="text-sm whitespace-pre-wrap">{claimData.clinicalFindings || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">BP</div>
                      <div className="text-sm">{claimData.vitals?.bp || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pulse</div>
                      <div className="text-sm">{claimData.vitals?.pulse || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Resp Rate</div>
                      <div className="text-sm">{claimData.vitals?.respRate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Temperature</div>
                      <div className="text-sm">{claimData.vitals?.temperature || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pain Scale</div>
                      <div className="text-sm">{claimData.vitals?.painScale || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insurance Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Insurance Company</div>
                      <div className="text-sm">{claimData.insuranceCompany || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Policy No</div>
                      <div className="text-sm">{claimData.policyNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plan Name</div>
                      <div className="text-sm">{claimData.planName || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Admission Required</div>
                      <div className="text-sm">{claimData.isAdmissionRequired || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Claim Form Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {claimFormChecklist.length > 0 ? (
                    claimFormChecklist.map((item, index) => renderChecklistItem(item, index))
                  ) : (
                    <div className="text-sm text-gray-500">No checklist items</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoice Tab */}
            <TabsContent value="invoice" className="space-y-6 flex-1 overflow-y-auto pb-8 min-h-96 overflow-x-hidden max-w-full">
              <Card className="overflow-x-hidden">
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-hidden">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Invoice No</div>
                      <div className="text-sm font-medium">{invoiceData.invoiceNo || claim.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Invoice Date</div>
                      <div className="text-sm">{invoiceData.invoiceDate || claim.uploadedOn}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Discharge Date</div>
                      <div className="text-sm">{invoiceData.dischargeDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Printed By</div>
                      <div className="text-sm">{invoiceData.printedBy || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto border-t" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                    <Table className="min-w-max">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead className="w-24">Date</TableHead>
                        <TableHead className="w-28">Code</TableHead>
                        <TableHead>Service Name</TableHead>
                        <TableHead className="w-16">QTY</TableHead>
                        <TableHead className="w-20">D.V</TableHead>
                        <TableHead className="w-20">N.D.V</TableHead>
                        <TableHead className="w-24">Total Invoice</TableHead>
                        <TableHead className="w-24">Guest Share</TableHead>
                        <TableHead className="w-28">Company Discount</TableHead>
                        <TableHead className="w-24">Company Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.no || index + 1}</TableCell>
                          <TableCell className="text-xs">{item.date || "-"}</TableCell>
                          <TableCell className="text-xs font-mono">{item.code}</TableCell>
                          <TableCell className="text-xs">{item.description || item.service}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.dv || "-"}</TableCell>
                          <TableCell>{item.ndv || "-"}</TableCell>
                          <TableCell>{item.totalInvoice || "-"}</TableCell>
                          <TableCell>{item.guestShare || "-"}</TableCell>
                          <TableCell>{item.companyDiscount || "-"}</TableCell>
                          <TableCell>{item.companyShare || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-x-hidden">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-hidden">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Invoice</div>
                      <div className="text-sm font-medium">{invoiceData.financialSummary?.totalInvoice || invoiceData.totalInvoice || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gross Amount</div>
                      <div className="text-sm font-medium">{invoiceData.financialSummary?.grossAmount || invoiceData.grossAmount || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Company Discount</div>
                      <div className="text-sm">{invoiceData.financialSummary?.companyDiscount || invoiceData.companyDiscount || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Fin. TRS</div>
                      <div className="text-sm">{invoiceData.financialSummary?.finTRS || invoiceData.finTRS || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Guest Payments</div>
                      <div className="text-sm">{invoiceData.financialSummary?.guestPayments || invoiceData.guestPayments || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Refunds</div>
                      <div className="text-sm">{invoiceData.financialSummary?.refunds || invoiceData.refunds || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Amount Due</div>
                      <div className="text-sm font-medium text-green-600">{invoiceData.financialSummary?.amountDue || invoiceData.amountDue || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Company Share</div>
                      <div className="text-sm font-medium">{invoiceData.financialSummary?.companyShare || invoiceData.companyShare || "0.00"}</div>
                    </div>
                  </div>
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
            <TabsContent value="approval" className="space-y-6 flex-1 overflow-y-auto pb-8 min-h-96">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Approval Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Pre-Approval Code</div>
                      <div className="text-sm font-medium">{approvalData.preApprovalCode || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="text-sm">{approvalData.preApprovalStatus || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Applied Date</div>
                      <div className="text-sm">{approvalData.appliedDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Approval Date</div>
                      <div className="text-sm">{approvalData.approvalDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Insured Name</div>
                      <div className="text-sm">{approvalData.insuredName || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Member ID</div>
                      <div className="text-sm">{approvalData.memberId || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Age/Gender</div>
                      <div className="text-sm">{approvalData.ageGender || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Medical Record No</div>
                      <div className="text-sm">{approvalData.medicalRecordNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Provider Name</div>
                      <div className="text-sm">{approvalData.providerName || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Policy Holder</div>
                      <div className="text-sm">{approvalData.policyHolder || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Policy No</div>
                      <div className="text-sm">{approvalData.policyNo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-sm">{approvalData.type || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Priority</div>
                      <div className="text-sm">{approvalData.priority || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Admission Date</div>
                      <div className="text-sm">{approvalData.admissionDate || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Facility</div>
                      <div className="text-sm">{approvalData.facility || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Doctor</div>
                      <div className="text-sm">{approvalData.doctor || "-"}</div>
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm text-gray-500">Primary Diagnosis</div>
                      <div className="text-sm">{approvalData.primaryDiagnosis || "-"}</div>
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm text-gray-500">About Present Illness</div>
                      <div className="text-sm whitespace-pre-wrap">{approvalData.aboutPresentIllness || "-"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benefit & Cost Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Currency</div>
                      <div className="text-sm">{approvalData.currency || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Benefit</div>
                      <div className="text-sm">{approvalData.benefit || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Co-Insurance</div>
                      <div className="text-sm">{approvalData.coIns || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Deductible</div>
                      <div className="text-sm">{approvalData.deductible || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Estimated Amount</div>
                      <div className="text-sm font-medium">{approvalData.currency || "QAR"} {approvalData.totalEstimatedAmount || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Approved Amount</div>
                      <div className="text-sm font-medium text-green-600">{approvalData.currency || "QAR"} {approvalData.totalApprovedAmount || "0.00"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Approved Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-max">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28">Treat/Drug Code</TableHead>
                        <TableHead>Treatment/Drug Desc (Reject/Approval Remarks)</TableHead>
                        <TableHead className="w-20">Quantity</TableHead>
                        <TableHead className="w-24">Est Amt</TableHead>
                        <TableHead className="w-24">Appr.Amt</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs font-mono">{item.code}</TableCell>
                          <TableCell className="text-xs">
                            {item.description}
                            {item.remarks && item.remarks !== "-" && (
                              <div className="text-xs text-gray-500 mt-1">({item.remarks})</div>
                            )}
                          </TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.estAmt}</TableCell>
                          <TableCell>{item.apprAmt || item.approvedAmt}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.status === "Approved" ? "bg-green-100 text-green-800" :
                              item.status === "Partial Approved" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {item.status || "Approved"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
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
            <TabsContent value="checklist" className="space-y-6 flex-1 overflow-y-auto pb-8 min-h-96">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {investigationChecklist.length > 0 ? (
                      investigationChecklist.map((item, index) => renderChecklistItem(item, index))
                    ) : (
                      <div className="text-sm text-gray-500">No investigation checks</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Emails Tab */}
            <TabsContent value="emails" className="space-y-6 flex-1 overflow-y-auto pb-8 min-h-96">
              <Card>
                <CardHeader>
                  <CardTitle>Email Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
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
                      {[...emailLog, ...mockEmailLog].map((email, index) => (
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
                  </div>
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
      </div>

      {/* Footer - Compact Summary & Actions */}
      <div className="bg-white border-t shrink-0 w-full overflow-x-hidden">
        <div className="p-3 space-y-3 max-w-full overflow-x-hidden">
          {/* Progress Bar - Real Stats */}
          <div className="space-y-2">
            {(() => {
              const claimFormStats = calculateChecklistStats(checklistData.ClaimForm);
              const approvalStats = calculateChecklistStats(checklistData.Approval);
              const invoiceStats = calculateChecklistStats(checklistData.Invoice);
              const investigationStats = calculateChecklistStats(checklistData.Investigation);
              
              const totalPassed = claimFormStats.passed + approvalStats.passed + invoiceStats.passed + investigationStats.passed;
              const totalItems = claimFormStats.total + approvalStats.total + invoiceStats.total + investigationStats.total;
              const overallPercentage = totalItems > 0 ? Math.round((totalPassed / totalItems) * 100) : 0;
              
              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Checklist Completion</span>
                    <span>{overallPercentage}% Complete</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Claim Form</div>
                      <Progress value={claimFormStats.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{claimFormStats.passed}/{claimFormStats.total} passed</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Approval</div>
                      <Progress value={approvalStats.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{approvalStats.passed}/{approvalStats.total} passed</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Invoice</div>
                      <Progress value={invoiceStats.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{invoiceStats.passed}/{invoiceStats.total} passed</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Investigation</div>
                      <Progress value={investigationStats.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{investigationStats.passed}/{investigationStats.total} passed</div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <Separator />

          {/* AI Suggestions & Actions - Separated Layout */}
          <div className="flex justify-between items-end">
            {/* AI Suggestions Box - Bottom Left */}
            <div className="bg-blue-50 rounded-lg p-3 max-w-xs">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium mb-1">AI Suggestions</div>
                  <ul className="text-xs text-gray-700 space-y-0.5">
                    <li>• Check partial approvals vs invoice total</li>
                    <li>• Send query to GSD for missing info</li>
                    <li>• Flag claim for reapproval follow-up</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Action Button - Bottom Right */}
            <Button 
              variant="default" 
              onClick={handleApproveClaim}
              disabled={isApproving}
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 h-10"
            >
              {isApproving ? 'Approving...' : 'Approve Claim'}
            </Button>
          </div>
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        claim={claim}
        checklistItem={selectedChecklistItem}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
