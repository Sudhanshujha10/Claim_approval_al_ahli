// api/revalidate.js - Re-run AI validation for a claim
import fs from 'fs';
import path from 'path';
import validateDoclingHandler from './validate-docling.js';

const CLAIMS_FILE = path.join(process.cwd(), 'api', '_data', 'claims.json');

export default async function handler(req, res) {
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

    // Get the original combined text and structured data
    const combinedText = claim.combinedText || '';
    const structuredData = claim.structuredData || [];

    // Re-run validation
    const mockReq = {
      method: 'POST',
      body: { combinedText, structuredData }
    };

    let validationResult;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          validationResult = data;
          return mockRes;
        }
      }),
      json: (data) => {
        validationResult = data;
        return mockRes;
      }
    };

    await validateDoclingHandler(mockReq, mockRes);

    if (validationResult && validationResult.ok) {
      // Update claim with new AI data
      claim.aiData = validationResult.aiData;
      claim.lastValidated = new Date().toISOString();

      // Save updated claims (preserve original structure)
      const dataToSave = Array.isArray(parsed) ? claims : { claims };
      fs.writeFileSync(CLAIMS_FILE, JSON.stringify(dataToSave, null, 2));

      return res.json({
        ok: true,
        aiData: validationResult.aiData,
        message: 'Validation re-run successfully'
      });
    } else {
      return res.status(500).json({
        ok: false,
        error: validationResult?.error || 'Validation failed'
      });
    }
  } catch (e) {
    console.error('Revalidation error:', e);
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}
