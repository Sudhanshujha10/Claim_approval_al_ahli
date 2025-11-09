// api/validate.js
import 'dotenv/config';
import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { combinedText, skeleton } = req.body || {};
  if (!combinedText) return res.status(400).json({ ok: false, error: 'combinedText is required' });

  const system = `You are a medical claims validation AI. Extract data AND validate against checklist rules.

Return STRICT JSON:
{
  "Claim": {
    "claimId": "File Number/ABC code",
    "patientName": "Full name",
    "doctor": "Doctor name",
    "department": "Department",
    "visitDate": "YYYY-MM-DD",
    "policyNo": "Member/Policy number",
    "insuranceCompany": "Insurer name",
    "diagnosis": "Diagnosis code or description",
    "gender": "Male/Female",
    "qid": "QID or Passport number",
    "dob": "Date of birth"
  },
  "Invoice": {
    "invoiceNo": "Invoice number",
    "date": "Invoice date",
    "items": [{"code": "service code", "description": "service", "qty": 1, "amount": 100.00}],
    "totalAmount": 0.00,
    "companyShare": 0.00,
    "patientShare": 0.00
  },
  "Approval": {
    "code": "Pre-Approval Code",
    "date": "Approval date",
    "status": "Approved/Partial/Rejected",
    "approvals": [{"code": "item code", "description": "service", "amount": 100.00, "status": "Approved"}],
    "totalAmount": 0.00
  },
  "Checklist": {
    "ClaimForm": [
      {"id": "cf1", "title": "EMR and Final Dx filled", "status": "pass/fail", "reason": "Missing EMR details"},
      {"id": "cf2", "title": "Doctor name & license present", "status": "pass/fail", "reason": ""},
      {"id": "cf3", "title": "Diagnosis requiring approval", "status": "pass/fail", "reason": "Pre-approval required but missing"},
      {"id": "cf4", "title": "Admission status recorded", "status": "pass/fail", "reason": ""}
    ],
    "Approval": [
      {"id": "ap1", "title": "Approval document present", "status": "pass/fail", "reason": "Missing approval code"},
      {"id": "ap2", "title": "Approval matches claim items", "status": "pass/fail", "reason": "Service X not in approval"},
      {"id": "ap3", "title": "Partial approvals justified", "status": "pass/fail", "reason": "Partial approval needs doctor justification"}
    ],
    "Invoice": [
      {"id": "inv1", "title": "Invoice matches approved items", "status": "pass/fail", "reason": "Amount mismatch"},
      {"id": "inv2", "title": "Discounts applied correctly", "status": "pass/fail", "reason": ""},
      {"id": "inv3", "title": "Submission within 60 days", "status": "pass/fail", "reason": "Late submission"}
    ],
    "Investigation": [
      {"id": "iv1", "title": "Lab/Radiology in approval vs invoice", "status": "pass/fail", "reason": ""},
      {"id": "iv2", "title": "No duplicate test entries", "status": "pass/fail", "reason": "Duplicate CBC found"}
    ]
  }
}

VALIDATION RULES:
1. ClaimForm: Check EMR/Dx filled, doctor name present, diagnosis needs approval, admission recorded
2. Approval: Check approval doc exists, items match claim, partial approvals noted
3. Invoice: Check amounts match approval, discounts correct, submission date within 60 days
4. Investigation: Check lab/radiology items match, no duplicates

Mark status as "fail" if rule violated, "pass" if OK. Provide specific reason for failures.`;
  
  const user = `Medical claim documents text:\n\n${String(combinedText).slice(0, 120000)}`;

  try {
    let content;
    if (client) {
      console.log('Calling OpenAI with', combinedText.length, 'chars of text...');
      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      });
      content = resp.choices?.[0]?.message?.content || '{}';
      console.log('OpenAI response received, length:', content.length);
      console.log('OpenAI response preview:', content.substring(0, 500));
    } else {
      console.log('No OpenAI client - using fallback mock data');
      content = JSON.stringify({
        Claim: {
          claimId: skeleton?.claimId || `OUT-${Date.now()}`,
          patientName: skeleton?.patientName || 'Unknown',
          doctor: skeleton?.doctor || 'Unknown',
          department: '—',
          status: 'Pending Review',
        },
        Invoice: { items: [] },
        Approval: { approvals: [] },
        Checklist: { ClaimForm: [], Approval: [], Invoice: [], Investigation: [] },
      });
    }

    let aiData;
    try { aiData = JSON.parse(content); } catch { aiData = { raw: content }; }
    return res.json({ ok: true, aiData, raw: content });
  } catch (e) {
    console.error('validate error', e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}