// api/send-email.js - Send email and log it
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const EMAILS_FILE = path.join(process.cwd(), 'api', '_data', 'emails.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { claimId, from, to, cc, subject, htmlBody, attachments } = req.body;
  
  if (!claimId || !from || !to || !subject || !htmlBody) {
    return res.status(400).json({ 
      ok: false, 
      error: 'claimId, from, to, subject, and htmlBody are required' 
    });
  }

  try {
    // Create email record
    const emailRecord = {
      id: uuidv4(),
      claimId,
      from,
      to: Array.isArray(to) ? to : [to],
      cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
      subject,
      bodyHtml: htmlBody,
      status: 'sent', // Simulate successful send
      messageId: `<${uuidv4()}@alahli.com>`, // Simulate SMTP message ID
      date: new Date().toISOString(),
      attachments: attachments || []
    };

    // Load existing emails
    let emails = [];
    try {
      if (fs.existsSync(EMAILS_FILE)) {
        const emailsData = fs.readFileSync(EMAILS_FILE, 'utf8');
        const parsed = JSON.parse(emailsData);
        emails = Array.isArray(parsed) ? parsed : (parsed.emails || []);
      }
    } catch (e) {
      console.warn('Could not load existing emails, starting fresh');
    }

    // Add new email
    emails.unshift(emailRecord);

    // Save emails
    const emailsDir = path.dirname(EMAILS_FILE);
    if (!fs.existsSync(emailsDir)) {
      fs.mkdirSync(emailsDir, { recursive: true });
    }
    
    fs.writeFileSync(EMAILS_FILE, JSON.stringify({ emails }, null, 2));

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.json({
      ok: true,
      emailRecord,
      message: 'Email sent successfully'
    });
  } catch (e) {
    console.error('Send email error:', e);
    
    // Create failed email record
    const failedEmailRecord = {
      id: uuidv4(),
      claimId,
      from,
      to: Array.isArray(to) ? to : [to],
      cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
      subject,
      bodyHtml: htmlBody,
      status: 'failed',
      messageId: null,
      date: new Date().toISOString(),
      attachments: attachments || [],
      error: e.message
    };

    return res.status(500).json({ 
      ok: false, 
      error: String(e.message),
      emailRecord: failedEmailRecord
    });
  }
}
