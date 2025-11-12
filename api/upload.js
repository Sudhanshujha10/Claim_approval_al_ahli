// api/upload.js
import formidable from "formidable";
import fs from "fs";
import path from "path";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// 
const UPLOADS_DIR = path.join(process.cwd(), 'api', '_data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Use pdfjs-dist for proper PDF text extraction
async function extractPdfText(buffer) {
  try {
    console.log('Attempting pdfjs-dist extraction...');
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Successfully extracted', fullText.length, 'chars');
    return { text: fullText.trim() };
  } catch (e) {
    console.error('pdfjs-dist extraction failed:', e.message);
    console.error('Full error:', e);
    // Fallback to basic text extraction
    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 5000));
    return { text: text || `PDF parsing failed (${buffer.length} bytes)` };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const form = formidable({ multiples: true, keepExtensions: true });
  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error('Formidable parse error:', err);
      return res.status(500).json({ ok: false, error: String(err) });
    }

    const fileList =
      (files.files && (Array.isArray(files.files) ? files.files : [files.files])) || [];
    if (!fileList.length) return res.status(400).json({ ok: false, error: "No files uploaded" });

    try {
      const extracted = [];
      const timestamp = Date.now();
      
      for (const f of fileList) {
        console.log('Processing file:', f.originalFilename || f.newFilename, 'at', f.filepath);
        const buffer = await fs.promises.readFile(f.filepath);
        console.log('Buffer size:', buffer.length);
        
        const parsed = await extractPdfText(buffer);
        console.log('Extracted text length:', parsed?.text?.length || 0);
        
        // Save file permanently
        const originalName = f.originalFilename || f.newFilename || "file.pdf";
        const savedFilename = `${timestamp}_${originalName}`;
        const savedPath = path.join(UPLOADS_DIR, savedFilename);
        await fs.promises.copyFile(f.filepath, savedPath);
        console.log('Saved file to:', savedPath);
        
        extracted.push({ 
          filename: originalName,
          savedFilename: savedFilename,
          filePath: `/api/files/${savedFilename}`,
          text: parsed.text || "" 
        });
      }

      const combinedText = extracted
        .map((e) => `--- ${e.filename} ---\n${e.text}`)
        .join("\n\n");

      const skeleton = {
        claimId: (combinedText.match(/OUT\\d{4,}/i) || [])[0] || "",
        patientName: (combinedText.match(/patient\\s*name[:\\-]?\\s*([A-Za-z\\s]{3,})/i) || [,""])[1].trim?.() || "",
        doctor: (combinedText.match(/doctor\\s*name[:\\-]?\\s*([A-Za-z\\.\\s]{3,})/i) || [,""])[1].trim?.() || "",
        visitDate:
          (combinedText.match(/\\b(20\\d{2}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}[-/.]20\\d{2})\\b/) || [])[0] || "",
        policyNo: (combinedText.match(/\\b(POL[-\\s:]?\\w+|\\d{6,})\\b/i) || [])[0] || "",
      };

      const filesMeta = extracted.map((e) => ({ 
        name: e.filename,
        savedFilename: e.savedFilename,
        filePath: e.filePath
      }));

      return res.json({ ok: true, files: filesMeta, combinedText, skeleton });
    } catch (e) {
      console.error('PDF parse error:', e);
      return res.status(500).json({ ok: false, error: "PDF parse failed", details: String(e?.message || e) });
    }
  });
}