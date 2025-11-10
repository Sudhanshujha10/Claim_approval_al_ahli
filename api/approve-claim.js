// api/approve-claim.js - Approve a claim
import fs from 'fs';
import path from 'path';

const CLAIMS_FILE = path.join(process.cwd(), 'api', '_data', 'claims.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { claimId } = req.body;
  
  if (!claimId) {
    return res.status(400).json({ ok: false, error: 'claimId is required' });
  }

  try {
    // Load claims
    const claimsData = fs.readFileSync(CLAIMS_FILE, 'utf8');
    const parsed = JSON.parse(claimsData);
    const claims = Array.isArray(parsed) ? parsed : (parsed.claims || []);
    
    // Find the claim
    const claim = claims.find(c => c.id === claimId);
    if (!claim) {
      return res.status(404).json({ ok: false, error: 'Claim not found' });
    }

    // Update status to Approved
    claim.status = 'Approved';
    claim.approvedAt = new Date().toISOString();
    claim.approvedDate = new Date().toLocaleDateString('en-GB');

    // Save updated claims (preserve original structure)
    const dataToSave = Array.isArray(parsed) ? claims : { claims };
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(dataToSave, null, 2));

    return res.json({
      ok: true,
      claim,
      message: 'Claim approved successfully'
    });
  } catch (e) {
    console.error('Approve claim error:', e);
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}
