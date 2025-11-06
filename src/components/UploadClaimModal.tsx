import { useState } from "react";
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
}

export function UploadClaimModal({ open, onOpenChange }: UploadClaimModalProps) {
  const [files, setFiles] = useState<{
    claimForm: File | null;
    invoice: File | null;
    approval: File | null;
  }>({
    claimForm: null,
    invoice: null,
    approval: null,
  });
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (type: "claimForm" | "invoice" | "approval", file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleParseWithAI = () => {
    setIsParsing(true);
    // Simulate AI parsing
    setTimeout(() => {
      setIsParsing(false);
      alert("AI Parsing Complete! Claim data has been extracted and populated.");
      onOpenChange(false);
      setFiles({ claimForm: null, invoice: null, approval: null });
    }, 2000);
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
