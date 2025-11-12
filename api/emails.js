// api/emails.js - Get emails for a claim
import fs from 'fs';
import path from 'path';

const EMAILS_FILE = path.join(process.cwd(), 'api', '_data', 'emails.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { claimId } = req.query;

  try {
    // Load emails
    let emails = [];
    try {
      if (fs.existsSync(EMAILS_FILE)) {
        const emailsData = fs.readFileSync(EMAILS_FILE, 'utf8');
        const parsed = JSON.parse(emailsData);
        emails = Array.isArray(parsed) ? parsed : (parsed.emails || []);
      }
    } catch (e) {
      console.warn('Could not load emails file');
    }

    // Filter by claimId if provided
    if (claimId) {
      emails = emails.filter(email => email.claimId === claimId);
    }

    return res.json({
      ok: true,
      emails: emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (e) {
    console.error('Get emails error:', e);
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}
