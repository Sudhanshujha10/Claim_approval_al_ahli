// api/files.js - Serve uploaded PDF files
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'api', '_data', 'uploads');

export default function handler(req, res) {
  // Extract filename from params
  const filename = req.params.filename;
  
  if (!filename) {
    return res.status(400).json({ ok: false, error: 'Filename required' });
  }

  const filePath = path.join(UPLOADS_DIR, filename);

  // Security: prevent directory traversal
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return res.status(403).json({ ok: false, error: 'Access denied' });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: 'File not found' });
  }

  try {
    // Set proper headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (e) {
    console.error('File serve error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to serve file' });
  }
}
