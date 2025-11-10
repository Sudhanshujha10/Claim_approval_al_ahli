// api/upload-vision.js - Enhanced PDF parsing using OpenAI Vision API
import 'dotenv/config';
import formidable from "formidable";
import fs from "fs";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Convert PDF page to image and extract using Vision API
async function extractPdfWithVision(buffer, filename) {
  try {
    console.log('Using Vision API for:', filename);
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let allTables = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas and render PDF page
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to base64 image
      const imageBase64 = canvas.toDataURL('image/png').split(',')[1];
      
      // Use OpenAI Vision to extract table data
      if (client) {
        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract ALL data from this medical document page. If you see tables, extract EVERY row and EVERY column with exact values. Return as JSON with structure:
{
  "documentType": "Invoice" or "Claim Form" or "Approval",
  "tables": [
    {
      "headers": ["Column1", "Column2", ...],
      "rows": [
        ["value1", "value2", ...],
        ...
      ]
    }
  ],
  "metadata": {
    "invoiceNo": "...",
    "date": "...",
    "patientName": "...",
    etc.
  }
}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096
        });
        
        const content = response.choices?.[0]?.message?.content;
        if (content) {
          allTables.push(JSON.parse(content));
        }
      }
    }
    
    return { visionData: allTables };
  } catch (e) {
    console.error('Vision extraction failed:', e.message);
    return { visionData: [], error: e.message };
  }
}

// Fallback text extraction
async function extractPdfText(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (e) {
    console.error('Text extraction failed:', e.message);
    return '';
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
      for (const f of fileList) {
        console.log('Processing file:', f.originalFilename || f.newFilename);
        const buffer = await fs.promises.readFile(f.filepath);
        
        // Use Vision API for table extraction
        const visionResult = await extractPdfWithVision(buffer, f.originalFilename);
        
        // Also get text as fallback
        const text = await extractPdfText(buffer);
        
        extracted.push({
          filename: f.originalFilename || f.newFilename || "file.pdf",
          text: text,
          visionData: visionResult.visionData
        });
      }

      const combinedText = extracted
        .map((e) => `--- ${e.filename} ---\n${e.text}`)
        .join("\n\n");

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
        visionData: extracted.map(e => e.visionData).flat()
      });
    } catch (e) {
      console.error('PDF parse error:', e);
      return res.status(500).json({ ok: false, error: "PDF parse failed", details: String(e?.message || e) });
    }
  });
}
