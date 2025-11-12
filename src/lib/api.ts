export interface UploadResp {
  ok: boolean;
  files: { name: string }[];
  combinedText: string;
  skeleton?: any;
  error?: string;
}

export interface ValidateResp {
  ok: boolean;
  aiData: any;
  raw?: any;
  error?: string;
}

// Use environment variable for production, local backend for dev
const BASE_URL = import.meta.env.VITE_API_URL || "";

export async function uploadClaimFiles(files: File[]): Promise<UploadResp> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f, f.name));
  // Use basic upload endpoint for faster processing (text extraction only)
  const r = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
  return r.json();
}

export async function validateClaim(combinedText: string, skeleton?: any, structuredData?: any): Promise<ValidateResp> {
  // Use Docling endpoint with structured data and detailed checklist validation
  const r = await fetch(`${BASE_URL}/api/validate-docling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ combinedText, skeleton, structuredData }),
  });
  if (!r.ok) throw new Error(`Validate failed: ${r.status}`);
  return r.json();
}

// Claims API
export async function listClaims(): Promise<{ ok: boolean; claims: any[] }> {
  const r = await fetch(`${BASE_URL}/api/claims`);
  if (!r.ok) throw new Error(`listClaims failed: ${r.status}`);
  return r.json();
}

export async function getClaim(id: string): Promise<{ ok: boolean; claim: any }> {
  const r = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`getClaim failed: ${r.status}`);
  return r.json();
}

export async function createClaim(claim: any): Promise<{ ok: boolean; claim: any }> {
  const r = await fetch(`${BASE_URL}/api/claims`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });
  if (!r.ok) throw new Error(`createClaim failed: ${r.status}`);
  return r.json();
}

export function computeChecklistStats(aiData: any): { passed: number; failed: number; total: number } {
  const sections = [
    aiData?.Checklist?.ClaimForm,
    aiData?.Checklist?.Approval,
    aiData?.Checklist?.Invoice,
    aiData?.Checklist?.Investigation,
  ].filter(Boolean) as any[];
  let passed = 0, failed = 0, total = 0;
  for (const sec of sections) {
    const arr = Array.isArray(sec) ? sec : [];
    for (const item of arr) {
      total += 1;
      const s = String(item?.status || "").toLowerCase();
      if (s === "pass" || s === "passed") passed += 1;
      else if (s === "fail" || s === "failed") failed += 1;
    }
  }
  return { passed, failed, total };
}
