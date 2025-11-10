// api/upload-docling.js - Upload handler using Python Docling microservice
import formidable from "formidable";
import fs from "fs";
import FormData from 'form-data';
import fetch from 'node-fetch';

const PYTHON_PARSER_URL = process.env.PYTHON_PARSER_URL || 'http://localhost:5001';

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
      console.log('Sending', fileList.length, 'files to Python parser...');
      
      // Create FormData for Python service
      const formData = new FormData();
      for (const f of fileList) {
        const fileBuffer = await fs.promises.readFile(f.filepath);
        formData.append('files', fileBuffer, {
          filename: f.originalFilename || f.newFilename || 'document.pdf',
          contentType: 'application/pdf'
        });
      }

      // Call Python microservice
      const response = await fetch(`${PYTHON_PARSER_URL}/parse-multiple`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Python parser error:', errorText);
        throw new Error(`Python parser failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error || 'Python parser returned error');
      }

      console.log('Successfully parsed', result.documents?.length || 0, 'documents');
      
      // Process results
      const extracted = result.documents.map(doc => {
        console.log(`Document: ${doc.filename} (${doc.documentType})`);
        console.log(`  Tables found: ${doc.tables?.length || 0}`);
        
        if (doc.tables && doc.tables.length > 0) {
          doc.tables.forEach((table, idx) => {
            console.log(`  Table ${idx + 1}: ${table.headers?.length || 0} columns, ${table.rows?.length || 0} rows`);
          });
        }
        
        return {
          filename: doc.filename,
          documentType: doc.documentType,
          text: doc.text,
          tables: doc.tables
        };
      });

      // Combine text for AI processing
      const combinedText = extracted
        .map((e) => `--- ${e.filename} (${e.documentType}) ---\n${e.text}`)
        .join("\n\n");

      // Extract skeleton data
      const skeleton = {
        claimId: (combinedText.match(/OUT\d{4,}/i) || [])[0] || "",
        patientName: (combinedText.match(/patient\s*name[:\-]?\s*([A-Za-z\s]{3,})/i) || [,""])[1].trim?.() || "",
        doctor: (combinedText.match(/doctor\s*name[:\-]?\s*([A-Za-z\.\s]{3,})/i) || [,""])[1].trim?.() || "",
      };

      const filesMeta = extracted.map((e) => ({ name: e.filename }));

      return res.json({
        ok: true,
        files: filesMeta,
        combinedText,
        skeleton,
        structuredData: extracted // Include structured table data
      });
    } catch (e) {
      console.error('PDF parse error:', e);
      return res.status(500).json({
        ok: false,
        error: "PDF parse failed",
        details: String(e?.message || e)
      });
    }
  });
}
