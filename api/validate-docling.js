// api/validate-docling.js - Enhanced validation using Docling structured data
import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Load admin configuration
function getAdminConfig() {
  try {
    const configPath = path.join(process.cwd(), 'data', 'admin-config.json');
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading admin config:', e.message);
  }
  return {
    servicesRequiringApproval: [],
    diagnosisCodesRequiringApproval: [],
    coverageExceptions: []
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { combinedText, skeleton, structuredData } = req.body || {};
  if (!combinedText) return res.status(400).json({ ok: false, error: 'combinedText is required' });

  const system = `You are a medical claims validation AI. You will receive:
1. Structured table data extracted from PDFs (with exact rows and columns)
2. Full text content for context

Your task:
1. Use the structured table data to populate Invoice items and Approval items with EXACT values
2. Extract claim form details from text
3. Validate all data against checklist rules

Return STRICT JSON:
{
  "Claim": {
    "claimId": "File/Visit Number",
    "patientName": "Full guest name",
    "guestFileNo": "Guest File No",
    "qid": "QID/Passport number",
    "memberNo": "Member number",
    "dob": "Date of birth DD/MM/YYYY",
    "gender": "Male/Female",
    "telNo": "Phone number",
    "nationality": "Nationality",
    "doctor": "Doctor's full name with title",
    "department": "Department/Clinic name",
    "visitDate": "Visit date DD/MM/YYYY",
    "visitType": "Emergency/Outpatient/Inpatient",
    "policyNo": "Policy/Group number",
    "insuranceCompany": "Full insurance company name",
    "planName": "Insurance plan name",
    "diagnosis": "Medical diagnosis with ICD code",
    "chiefComplaint": "Chief complaint and duration",
    "clinicalFindings": "Clinical findings text",
    "vitals": {
      "bp": "Blood pressure",
      "pulse": "Pulse rate",
      "respRate": "Respiratory rate",
      "temperature": "Temperature",
      "painScale": "Pain scale"
    },
    "isAdmissionRequired": "Yes/No",
    "registeredBy": "Staff who registered",
    "regDateTime": "Registration date and time"
  },
  "Invoice": {
    "invoiceNo": "Invoice number",
    "invoiceDate": "Invoice date DD/MM/YYYY",
    "dischargeDate": "Discharge date",
    "printedBy": "Printed by",
    "printingDateTime": "Printing date and time",
    "items": [
      {
        "no": "Row number from table",
        "date": "Service date from table",
        "code": "Service code from table",
        "description": "Service description from table",
        "qty": "Quantity from table",
        "dv": "D.V value from table",
        "ndv": "N.D.V value from table",
        "totalInvoice": "Total Invoice from table",
        "guestShare": "Guest Share from table",
        "companyDiscount": "Company Discount from table",
        "companyShare": "Company Share from table"
      }
    ],
    "financialSummary": {
      "totalInvoice": "Total invoice amount",
      "grossAmount": "Gross amount",
      "companyDiscount": "Total company discount",
      "finTRS": "Financial TRS",
      "guestPayments": "Guest payments",
      "refunds": "Refunds",
      "amountDue": "Amount due",
      "companyShare": "Company share"
    }
  },
  "Approval": {
    "preApprovalCode": "Pre-approval code",
    "preApprovalStatus": "Approved/Partial Approved/Rejected",
    "appliedDate": "Applied date DD/MM/YYYY HH:MM",
    "approvalDate": "Approval date DD/MM/YYYY HH:MM",
    "printDate": "Print date",
    "insuredName": "Insured name",
    "memberId": "Member ID",
    "ageGender": "Age and gender",
    "medicalRecordNo": "Medical record number",
    "providerName": "Provider/Hospital name",
    "policyHolder": "Policy holder name",
    "policyNo": "Policy number",
    "type": "Out-Patient/In-Patient",
    "priority": "URGENT/Normal",
    "admissionDate": "Admission date",
    "admissionType": "Illness/Injury",
    "illness": "Acute/Chronic",
    "facility": "Facility/Department",
    "doctor": "Doctor name",
    "primaryDiagnosis": "Primary diagnosis",
    "aboutPresentIllness": "Detailed illness description",
    "currency": "Currency (QAR/SAR)",
    "benefit": "Benefit type",
    "subBenefit": "Sub-benefit",
    "coIns": "Co-insurance percentage",
    "deductible": "Deductible amount",
    "totalEstimatedAmount": "Total estimated amount",
    "totalApprovedAmount": "Total approved amount",
    "approvals": [
      {
        "code": "Treatment/Drug code from table",
        "description": "Treatment/Drug description from table",
        "qty": "Quantity from table",
        "estAmt": "Estimated amount from table",
        "apprAmt": "Approved amount from table",
        "status": "Status from table (Approved/Partial Approved/Rejected)",
        "remarks": "Remarks from table or '-'"
      }
    ]
  },
  "Checklist": {
    "ClaimForm": [
      {"id": "cf1", "title": "EMR Details and Final Diagnosis Filled", "status": "pass/fail", "reason": "Check patient demographics (Name, DOB, Gender, Member No., File No., Provider, Clinic, Date) AND diagnosis field. PASS if all filled. FAIL if any blank.", "confidence": 0.95},
      {"id": "cf2", "title": "Diagnosis Requires Pre-Approval", "status": "pass/fail", "reason": "Compare diagnosis code with admin list. PASS if not in list OR approved. FAIL if in list without approval.", "confidence": 0.92},
      {"id": "cf3", "title": "Service Charges Require Approval", "status": "pass/fail", "reason": "Check service codes vs admin list. PASS if all requiring approval have it. FAIL if any missing approval.", "confidence": 0.90},
      {"id": "cf4", "title": "Total Claim Value Above Policy Threshold", "status": "pass/fail", "reason": "Check if total claim exceeds threshold. PASS if below OR above with approval. FAIL if above without approval.", "confidence": 0.88},
      {"id": "cf5", "title": "Approval Availability", "status": "pass/fail", "reason": "Check if approval document exists. PASS if present. FAIL if missing.", "confidence": 0.95}
    ],
    "Approval": [
      {"id": "ap1", "title": "Approval Obtained Prior to Service Date", "status": "pass/fail", "reason": "Check approval date <= service date. PASS if before/on. FAIL if after (retro-approval).", "confidence": 0.93},
      {"id": "ap2", "title": "All Services Billed Are Approved", "status": "pass/fail", "reason": "Compare claim services vs approval. PASS if all approved. FAIL if any service not approved/rejected.", "confidence": 0.91},
      {"id": "ap3", "title": "Partial Approvals and Remarks Check", "status": "pass/fail", "reason": "Check for partial/rejected with remarks. PASS if no action needed. FAIL if requires medical justification.", "confidence": 0.85},
      {"id": "ap4", "title": "Co-pay/Deductible Applied Correctly", "status": "pass/fail", "reason": "Verify deductible in approval matches invoice. PASS if matches. FAIL if mismatch.", "confidence": 0.89},
      {"id": "ap5", "title": "Approval Validity Period", "status": "pass/fail", "reason": "Check service within 60 days of approval. PASS if within validity. FAIL if expired.", "confidence": 0.92}
    ],
    "Invoice": [
      {"id": "inv1", "title": "Invoice Matches Approved Services Only", "status": "pass/fail", "reason": "Cross-check invoice vs approval codes. PASS if all match. FAIL if new service without approval.", "confidence": 0.90},
      {"id": "inv2", "title": "Approved vs Charged Amounts Match", "status": "pass/fail", "reason": "Compare approved amounts vs billed. PASS if match/under. FAIL if overbilled.", "confidence": 0.87},
      {"id": "inv3", "title": "Discounts and Company Share Accurate", "status": "pass/fail", "reason": "Verify company discount applied correctly. PASS if accurate. FAIL if mismatch.", "confidence": 0.86},
      {"id": "inv4", "title": "Deductible Reflected in Invoice", "status": "pass/fail", "reason": "Check deductible from approval in invoice. PASS if reflected. FAIL if missing.", "confidence": 0.88},
      {"id": "inv5", "title": "Submission Within 60-day Limit", "status": "pass/fail", "reason": "Check invoice date vs service date <=60 days. PASS if within. FAIL if delayed.", "confidence": 0.94}
    ],
    "Investigation": [
      {"id": "iv1", "title": "All Approved Investigations Billed", "status": "pass/fail", "reason": "Check all approved labs in invoice. PASS if all present. FAIL if any missing.", "confidence": 0.89},
      {"id": "iv2", "title": "No Unapproved Investigations Billed", "status": "pass/fail", "reason": "Check for unapproved labs in invoice. PASS if none. FAIL if unapproved billed.", "confidence": 0.91},
      {"id": "iv3", "title": "Investigation Date Matches Service Date", "status": "pass/fail", "reason": "Verify lab date matches claim date. PASS if matches. FAIL if mismatch.", "confidence": 0.87},
      {"id": "iv4", "title": "Investigation Cost Aligns with Contract", "status": "pass/fail", "reason": "Compare lab rates with contract. PASS if aligned. FAIL if discrepancy.", "confidence": 0.82}
    ]
  }
}

CRITICAL INSTRUCTIONS:
1. Use the structured table data provided. Each table has headers and rows arrays. Map them directly to Invoice items and Approval items.
2. For EACH checklist item, YOU MUST calculate and provide a "confidence" score (0.0 to 1.0) indicating how confident you are in the validation result.
3. Confidence calculation rules:
   - HIGH (0.85-1.0): All required data clearly visible and unambiguous
   - MEDIUM (0.65-0.84): Some data present but may have minor ambiguities
   - LOW (0.0-0.64): Missing data, unclear information, or significant ambiguities
4. ALWAYS include "manualOverride": false for all items in your response.
5. Replace "pass/fail" with actual "pass" or "fail" based on your validation.
6. Replace template reasons with SPECIFIC, DETAILED reasons based on the actual document data.
7. Example of correct checklist item format:
   {"id": "cf1", "title": "EMR Details and Final Diagnosis Filled", "status": "pass", "reason": "All patient demographics present: Name (John Doe), DOB (01/01/1980), Member No (12345), Diagnosis (R10.30) clearly stated.", "confidence": 0.95, "manualOverride": false}

RETURN THE COMPLETE JSON WITH ALL FIELDS POPULATED.`;

  // Load admin configuration
  const adminConfig = getAdminConfig();
  
  // Build user prompt with structured data and admin config
  let userPrompt = `Medical claim documents:\n\n`;
  
  // Add admin configuration for validation
  userPrompt += `ADMIN CONFIGURATION FOR VALIDATION:\n\n`;
  userPrompt += `Services Requiring Pre-Approval (${adminConfig.servicesRequiringApproval.length} services):\n`;
  adminConfig.servicesRequiringApproval.forEach(svc => {
    userPrompt += `- ${svc.code}: ${svc.name}\n`;
  });
  userPrompt += `\nDiagnosis Codes Requiring Pre-Approval (${adminConfig.diagnosisCodesRequiringApproval.length} codes):\n`;
  adminConfig.diagnosisCodesRequiringApproval.forEach(dx => {
    userPrompt += `- ${dx.code}: ${dx.description}\n`;
  });
  userPrompt += `\n---\n\n`;
  
  if (structuredData && Array.isArray(structuredData)) {
    userPrompt += `STRUCTURED TABLE DATA:\n`;
    structuredData.forEach((doc, idx) => {
      userPrompt += `\nDocument ${idx + 1}: ${doc.filename} (${doc.documentType})\n`;
      if (doc.tables && doc.tables.length > 0) {
        doc.tables.forEach((table, tableIdx) => {
          userPrompt += `\nTable ${tableIdx + 1}:\n`;
          userPrompt += `Headers: ${JSON.stringify(table.headers)}\n`;
          userPrompt += `Rows:\n`;
          table.rows.forEach((row, rowIdx) => {
            userPrompt += `  Row ${rowIdx + 1}: ${JSON.stringify(row)}\n`;
          });
        });
      }
    });
    userPrompt += `\n---\n\n`;
  }
  
  userPrompt += `FULL TEXT CONTENT:\n${String(combinedText).slice(0, 80000)}`;

  try {
    let content;
    if (client) {
      console.log('Calling OpenAI with structured data...');
      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });
      content = resp.choices?.[0]?.message?.content || '{}';
      console.log('OpenAI response received, length:', content.length);
      
      // Parse and log
      try {
        const parsed = JSON.parse(content);
        console.log('\n=== EXTRACTED DATA SUMMARY ===');
        console.log('Invoice items count:', parsed.Invoice?.items?.length || 0);
        if (parsed.Invoice?.items?.length > 0) {
          console.log('First invoice item:', JSON.stringify(parsed.Invoice.items[0], null, 2));
        }
        console.log('Approval items count:', parsed.Approval?.approvals?.length || 0);
        if (parsed.Approval?.approvals?.length > 0) {
          console.log('First approval item:', JSON.stringify(parsed.Approval.approvals[0], null, 2));
        }
        console.log('==============================\n');
      } catch (e) {
        console.log('Could not parse response for logging:', e.message);
      }
    } else {
      console.log('No OpenAI client - using fallback');
      content = JSON.stringify({ Claim: {}, Invoice: {}, Approval: {}, Checklist: {} });
    }

    const aiData = JSON.parse(content);
    return res.json({ ok: true, aiData, raw: content });
  } catch (e) {
    console.error('Validation error:', e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
