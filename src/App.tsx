import { useEffect, useState } from "react";
import { NavigationSidebar } from "./components/NavigationSidebar";
import { AppHeader } from "./components/AppHeader";
import { Dashboard } from "./components/Dashboard";
import { ClaimDetail } from "./components/ClaimDetail";
import { AdminConfig } from "./components/AdminConfig";
import { Reports } from "./components/Reports";
import { EmailCenter } from "./components/EmailCenter";
import type { Claim } from "./components/ClaimsTable";
import { listClaims } from "./lib/api";

// Mock data for claims
const mockClaims: Claim[] = [
  {
    id: "OUT7618737",
    patientName: "DEEMAH ISSA ABUD ELAYAN",
    doctor: "Dr. Issa Abuzuaiter",
    department: "Emergency",
    status: "Pending GSD Review",
    uploadedBy: "Sadia Khalil",
    uploadedOn: "21/07/2025",
    checklistPassed: 7,
    checklistFailed: 3,
    checklistTotal: 10,
  },
  {
    id: "OUT7561407",
    patientName: "ALMAHRA ABDULAZIZ A S AL-ENAZI",
    doctor: "Dr. Ossama Sharafeldin",
    department: "Pediatrics",
    status: "Approved",
    uploadedBy: "Belinda Pilotin",
    uploadedOn: "01/06/2025",
    checklistPassed: 10,
    checklistFailed: 0,
    checklistTotal: 10,
  },
  {
    id: "OUT7592388",
    patientName: "ABDULLAH MOHAMMED AL SAID",
    doctor: "Dr. Khalid Youssef",
    department: "Lab Services",
    status: "Query Raised",
    uploadedBy: "Mohamed Sultan",
    uploadedOn: "11/06/2025",
    checklistPassed: 5,
    checklistFailed: 2,
    checklistTotal: 7,
  },
  {
    id: "OUT7234512",
    patientName: "SARAH AHMED AL-MUTAIRI",
    doctor: "Dr. Fatima Hassan",
    department: "Cardiology",
    status: "Pending",
    uploadedBy: "Sadia Khalil",
    uploadedOn: "15/07/2025",
    checklistPassed: 8,
    checklistFailed: 2,
    checklistTotal: 10,
  },
  {
    id: "OUT7345623",
    patientName: "KHALID OMAR AL-RASHID",
    doctor: "Dr. Mohammed Ali",
    department: "Orthopedics",
    status: "Approved",
    uploadedBy: "Belinda Pilotin",
    uploadedOn: "10/06/2025",
    checklistPassed: 9,
    checklistFailed: 0,
    checklistTotal: 9,
  },
  {
    id: "OUT7456734",
    patientName: "NORA HASSAN AL-QAHTANI",
    doctor: "Dr. Aisha Rahman",
    department: "Dermatology",
    status: "Rejected",
    uploadedBy: "Mohamed Sultan",
    uploadedOn: "05/06/2025",
    checklistPassed: 4,
    checklistFailed: 5,
    checklistTotal: 9,
  },
  {
    id: "OUT7567845",
    patientName: "FAISAL IBRAHIM AL-DOSARI",
    doctor: "Dr. Yusuf Khan",
    department: "Neurology",
    status: "Manual Review",
    uploadedBy: "Sadia Khalil",
    uploadedOn: "18/07/2025",
    checklistPassed: 6,
    checklistFailed: 4,
    checklistTotal: 10,
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedClaimId, setSelectedClaimId] = useState(null as string | null);
  const [claims, setClaims] = useState([] as Claim[]);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedClaim = claims.find((c) => c.id === selectedClaimId);

  useEffect(() => {
    (async () => {
      try {
        const resp = await listClaims();
        if (resp.ok && Array.isArray(resp.claims)) {
          setClaims(resp.claims as Claim[]);
        } else {
          // seed with mock for first run when no backend data
          setClaims(mockClaims);
        }
      } catch {
        setClaims(mockClaims);
      }
    })();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedClaimId(null);
  };

  const handleViewClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
  };

  const handleBackFromClaim = () => {
    setSelectedClaimId(null);
  };

  const handleClaimCreated = (c: Claim) => {
    setClaims((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...prev[idx], ...c };
        return copy;
      }
      return [c, ...prev];
    });
    setSelectedClaimId(c.id);
  };

  const handleDeleteClaim = async (claimId: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/claims/${claimId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setClaims((prev) => prev.filter((c) => c.id !== claimId));
      } else {
        alert("Failed to delete claim");
      }
    } catch (error) {
      console.error("Error deleting claim:", error);
      alert("Error deleting claim");
    }
  };

  // If viewing claim detail
  if (selectedClaim) {
    return (
      <div className="flex h-screen overflow-hidden">
        <NavigationSidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ClaimDetail claim={selectedClaim} onBack={handleBackFromClaim} />
        </div>
      </div>
    );
  }

  // Main app layout with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <NavigationSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {currentPage !== "dashboard" && (
          <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        )}
        
        {/* Page Content */}
        {currentPage === "dashboard" && (
          <Dashboard 
            claims={claims}
            onViewClaim={handleViewClaim}
            onNavigate={handleNavigate}
            onClaimCreated={handleClaimCreated}
            onDeleteClaim={handleDeleteClaim}
          />
        )}
        
        {currentPage === "reports" && (
          <div className="flex-1 overflow-auto">
            <Reports />
          </div>
        )}
        
        {currentPage === "emails" && (
          <div className="flex-1 overflow-auto">
            <EmailCenter />
          </div>
        )}
        
        {currentPage === "admin" && (
          <div className="flex-1 overflow-auto">
            <AdminConfig />
          </div>
        )}
      </div>
    </div>
  );
}
