// api/admin/coverage-exceptions.js - Update coverage exceptions
import { updateCoverageExceptions } from '../admin-config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  return updateCoverageExceptions(req, res);
}
