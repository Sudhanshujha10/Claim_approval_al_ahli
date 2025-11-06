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
import { ChevronRight } from "lucide-react";

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
}

export function ClaimsTable({ claims, onViewClaim }: ClaimsTableProps) {
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
    <div className="p-4">
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim ID</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Uploaded On</TableHead>
              <TableHead>Checklist Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell>{claim.id}</TableCell>
                <TableCell>{claim.patientName}</TableCell>
                <TableCell>{claim.doctor}</TableCell>
                <TableCell>{claim.department}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                </TableCell>
                <TableCell>{claim.uploadedBy}</TableCell>
                <TableCell>{claim.uploadedOn}</TableCell>
                <TableCell>{getChecklistBadge(claim)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewClaim(claim.id)}
                    className="gap-1"
                  >
                    View Claim
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
