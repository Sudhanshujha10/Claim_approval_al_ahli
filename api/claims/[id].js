// api/claims/[id].js - Delete a specific claim
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLAIMS_FILE = path.join(__dirname, '../_data/claims.json');

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Claim ID is required' });
    }

    // Read current claims
    let claimsData = { claims: [] };
    if (fs.existsSync(CLAIMS_FILE)) {
      const fileContent = fs.readFileSync(CLAIMS_FILE, 'utf8');
      claimsData = JSON.parse(fileContent);
    }

    // Filter out the claim to delete
    const initialLength = claimsData.claims.length;
    claimsData.claims = claimsData.claims.filter(claim => claim.id !== id);

    if (claimsData.claims.length === initialLength) {
      return res.status(404).json({ ok: false, error: 'Claim not found' });
    }

    // Update lastUpdated timestamp
    claimsData.lastUpdated = new Date().toISOString();

    // Write back to file
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claimsData, null, 2));

    return res.status(200).json({ ok: true, message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim:', error);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
