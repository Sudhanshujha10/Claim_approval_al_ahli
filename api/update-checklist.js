// api/update-checklist.js - Update manual checklist overrides
import fs from 'fs';
import path from 'path';

const CLAIMS_FILE = path.join(process.cwd(), 'api', '_data', 'claims.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { claimId, checklistId, status, manualOverride } = req.body;
  
  if (!claimId || !checklistId) {
    return res.status(400).json({ ok: false, error: 'claimId and checklistId are required' });
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

    // Update the specific checklist item
    const aiData = claim.aiData || {};
    const checklist = aiData.Checklist || {};
    
    // Find and update the checklist item across all categories
    let updated = false;
    for (const category of ['ClaimForm', 'Approval', 'Invoice', 'Investigation']) {
      if (checklist[category]) {
        const item = checklist[category].find(i => i.id === checklistId);
        if (item) {
          if (status !== undefined) item.status = status;
          if (manualOverride !== undefined) item.manualOverride = manualOverride;
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return res.status(404).json({ ok: false, error: 'Checklist item not found' });
    }

    // Save updated claims (preserve original structure)
    const dataToSave = Array.isArray(parsed) ? claims : { claims };
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(dataToSave, null, 2));

    return res.json({
      ok: true,
      aiData: claim.aiData,
      message: 'Checklist updated successfully'
    });
  } catch (e) {
    console.error('Update checklist error:', e);
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}
