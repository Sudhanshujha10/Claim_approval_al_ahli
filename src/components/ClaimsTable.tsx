import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronRight, Trash2 } from "lucide-react";

export interface Claim {
  id: string;
  patientName: string;
  doctor: string;
  department: string;
  status: string;
  uploadedBy: string;
  uploadedOn: string;
  checklistPassed: number;
  checklistFailed: number;
  checklistTotal: number;
}

interface ClaimsTableProps {
  claims: Claim[];
  onViewClaim: (claimId: string) => void;
  onDeleteClaim?: (claimId: string) => void;
}

export function ClaimsTable({ claims, onViewClaim, onDeleteClaim }: ClaimsTableProps) {
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

  const getChecklistBadge = (claim: Claim) => {
    if (claim.checklistFailed === 0) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          ✅ All Passed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          ⚠️ {claim.checklistFailed} Failed / {claim.checklistPassed} Passed
        </Badge>
      );
    }
  };

  return (
    <div className="p-4 w-full max-w-full">
      <div className="rounded-lg border bg-white overflow-x-auto w-full" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
        <Table className="min-w-max">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="bg-white whitespace-nowrap">Claim ID</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Patient Name</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Doctor</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Department</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Status</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Uploaded By</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Uploaded On</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Checklist Status</TableHead>
              <TableHead className="bg-white whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="whitespace-nowrap">{claim.id}</TableCell>
                <TableCell className="whitespace-nowrap">{claim.patientName}</TableCell>
                <TableCell className="whitespace-nowrap">{claim.doctor}</TableCell>
                <TableCell className="whitespace-nowrap">{claim.department}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{claim.uploadedBy}</TableCell>
                <TableCell className="whitespace-nowrap">{claim.uploadedOn}</TableCell>
                <TableCell className="whitespace-nowrap">{getChecklistBadge(claim)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewClaim(claim.id)}
                      className="gap-1"
                    >
                      View Claim
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {onDeleteClaim && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete claim ${claim.id}?`)) {
                            onDeleteClaim(claim.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
