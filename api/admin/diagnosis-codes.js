// api/admin/diagnosis-codes.js - Update diagnosis codes requiring approval
import { updateDiagnosisCodes } from '../admin-config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return updateDiagnosisCodes(req, res);
}
