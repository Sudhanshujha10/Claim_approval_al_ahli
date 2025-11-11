// api/admin/services.js - Update services requiring approval
import { updateServices } from '../admin-config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return updateServices(req, res);
}
