// api/admin/config.js - Get admin configuration
import { getAdminConfig } from '../admin-config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return getAdminConfig(req, res);
}
