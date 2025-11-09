import { useState } from "react";
import { uploadClaimFiles, validateClaim, createClaim, computeChecklistStats } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";

interface UploadClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onParsed?: (claim: any) => void;
}

export function UploadClaimModal({ open, onOpenChange, onParsed }: UploadClaimModalProps) {
  const [files, setFiles] = useState({
    claimForm: null,
    invoice: null,
    approval: null,
  } as { claimForm: File | null; invoice: File | null; approval: File | null });
  const [isParsing, setIsParsing] = useState(false as boolean);
  const [error, setError] = useState(null as string | null);

  const handleFileChange = (type: "claimForm" | "invoice" | "approval", file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleParseWithAI = async () => {
    setError(null);
    setIsParsing(true);
    try {
      const selected: File[] = [];
      if (files.claimForm) selected.push(files.claimForm);
      if (files.invoice) selected.push(files.invoice);
      if (files.approval) selected.push(files.approval);

      console.log('Uploading files...');
      const up = await uploadClaimFiles(selected);
      console.log('Upload response:', up);
      if (!up.ok) throw new Error(up.error || "Upload failed");

      console.log('Validating claim...');
      const val = await validateClaim(up.combinedText, up.skeleton);
      console.log('Validation response:', val);
      if (!val.ok) throw new Error(val.error || "Validation failed");

      const ai = val.aiData || {};
      console.log('AI Data:', ai);
      const c = ai.Claim || {};
      console.log('Claim data from AI:', c);
      const { passed, failed, total } = computeChecklistStats(ai);

      const newClaim = {
        id: c.claimId || up.skeleton?.claimId || `OUT-${Date.now()}`,
        patientName: c.patientName || up.skeleton?.patientName || "Unknown",
        doctor: c.doctor || up.skeleton?.doctor || "Unknown",
        department: c.department || "—",
        status: c.status || (failed > 0 ? "Manual Review" : "Pending Review"),
        uploadedBy: "Claims Processor",
        uploadedOn: new Date().toLocaleDateString("en-GB"),
        checklistPassed: passed,
        checklistFailed: failed,
        checklistTotal: total,
        aiData: ai,
        files: up.files,
      };

      console.log('Creating claim:', newClaim);
      await createClaim(newClaim);
      console.log('Claim created successfully');
      onParsed?.(newClaim);
      onOpenChange(false);
      setFiles({ claimForm: null, invoice: null, approval: null });
    } catch (e: any) {
      console.error('Upload error:', e);
      setError(e?.message || String(e));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload New Claim</DialogTitle>
          <DialogDescription>
            Upload the required documents for the medical claim. The AI will parse and extract
            relevant information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {/* Medical Claim Form */}
          <div className="space-y-2">
            <Label htmlFor="claim-form">Medical Claim Form (PDF)</Label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="claim-form"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {files.claimForm ? files.claimForm.name : "Click to upload PDF"}
                </span>
              </label>
              <input
                id="claim-form"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileChange("claimForm", e.target.files?.[0] || null)}
              />
              {files.claimForm && <FileText className="h-5 w-5 text-blue-600" />}
            </div>
          </div>

          {/* Invoice */}
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice (PDF)</Label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="invoice"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {files.invoice ? files.invoice.name : "Click to upload PDF"}
                </span>
              </label>
              <input
                id="invoice"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileChange("invoice", e.target.files?.[0] || null)}
              />
              {files.invoice && <FileText className="h-5 w-5 text-blue-600" />}
            </div>
          </div>

          {/* Approval Document */}
          <div className="space-y-2">
            <Label htmlFor="approval">Approval Document (PDF)</Label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="approval"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {files.approval ? files.approval.name : "Click to upload PDF"}
                </span>
              </label>
              <input
                id="approval"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileChange("approval", e.target.files?.[0] || null)}
              />
              {files.approval && <FileText className="h-5 w-5 text-blue-600" />}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleParseWithAI}
            disabled={!files.claimForm || !files.invoice || !files.approval || isParsing}
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse with AI"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
