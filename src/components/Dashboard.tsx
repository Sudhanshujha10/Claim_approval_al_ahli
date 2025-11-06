import { useState, useMemo } from "react";
import { Header } from "./Header";
import { KPICards } from "./KPICards";
import { ClaimsTable, type Claim } from "./ClaimsTable";
import { UploadClaimModal } from "./UploadClaimModal";
import { Button } from "./ui/button";
import { FileUp, BarChart3, Settings } from "lucide-react";

interface DashboardProps {
  mockClaims: Claim[];
  onViewClaim: (claimId: string) => void;
  onNavigate: (page: string) => void;
}

export function Dashboard({ mockClaims, onViewClaim, onNavigate }: DashboardProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Filter and search claims
  const filteredClaims = useMemo(() => {
    let filtered = mockClaims;

    // Apply status filter
    if (activeFilter !== "All") {
      filtered = filtered.filter((claim) => {
        if (activeFilter === "Pending") {
          return claim.status.toLowerCase().includes("pending");
        } else if (activeFilter === "Manual Review") {
          return claim.status.toLowerCase().includes("manual review");
        }
        return claim.status.toLowerCase() === activeFilter.toLowerCase();
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (claim) =>
          claim.id.toLowerCase().includes(query) ||
          claim.patientName.toLowerCase().includes(query) ||
          claim.doctor.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeFilter, searchQuery, mockClaims]);

  // Calculate KPIs
  const kpiData = useMemo(() => {
    const totalClaims = mockClaims.length;
    const pendingReview = mockClaims.filter((c) =>
      c.status.toLowerCase().includes("pending")
    ).length;
    const autoValidated = mockClaims.filter((c) => c.checklistFailed === 0).length;
    const queriesRaised = mockClaims.filter((c) =>
      c.status.toLowerCase().includes("query")
    ).length;
    const approved = mockClaims.filter((c) =>
      c.status.toLowerCase() === "approved"
    ).length;

    return [
      { title: "Total Claims", value: totalClaims.toString() },
      { title: "Pending Review", value: pendingReview.toString() },
      { title: "AI Auto-Validated", value: autoValidated.toString() },
      { title: "Queries Raised", value: queriesRaised.toString() },
      { title: "Approved Claims", value: approved.toString() },
    ];
  }, [mockClaims]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-auto">
      <Header
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-auto">
        <KPICards data={kpiData} />
        <ClaimsTable claims={filteredClaims} onViewClaim={onViewClaim} />

        {/* Dashboard Actions */}
        <div className="p-4 flex gap-3">
          <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
            <FileUp className="h-4 w-4" />
            Upload New Claim
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onNavigate("reports")}>
            <BarChart3 className="h-4 w-4" />
            Go to Reports
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => onNavigate("admin")}>
            <Settings className="h-4 w-4" />
            Open Admin Settings
          </Button>
        </div>
      </div>

      <UploadClaimModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
