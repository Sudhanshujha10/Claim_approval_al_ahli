// api/validate.js
import 'dotenv/config';
import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const { combinedText, skeleton } = req.body || {};
  if (!combinedText) return res.status(400).json({ ok: false, error: 'combinedText is required' });

  const system = `You are a medical claims validation AI. Extract ALL data from claim documents and validate against strict checklist rules.

Return STRICT JSON with COMPLETE data extraction:
{
  "Claim": {
    "claimId": "File/Visit Number (e.g., OUT7561407, ABC7270)",
    "patientName": "Full guest name",
    "guestFileNo": "Guest File No (e.g., ACP6622)",
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
        "no": "Sequential item number (1, 2, 3...)",
        "date": "Service date DD/MM/YYYY",
        "code": "Service/medication code (e.g., CON0065, LAB00020, MED040043)",
        "description": "Full service/medication description",
        "qty": "Quantity as decimal (e.g., 1.00, 2.00)",
        "dv": "D.V amount (Discounted Value)",
        "ndv": "N.D.V amount (Non-Discounted Value)",
        "totalInvoice": "Total invoice amount for this line",
        "guestShare": "Guest share amount (patient pays)",
        "companyDiscount": "Company discount (negative if discount, e.g., (115.00))",
        "companyShare": "Company share amount (insurance pays)"
      }
    ],
    "financialSummary": {
      "totalInvoice": "Total invoice amount",
      "grossAmount": "Gross amount (first row)",
      "companyDiscount": "Total company discount",
      "finTRS": "Financial TRS",
      "guestPayments": "Guest payments",
      "refunds": "Refunds",
      "amountDue": "Amount due (final amount)",
      "companyShare": "Company share (second row gross)",
      "patientShare": "Patient share"
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
        "code": "Treatment/Drug code (e.g., LAB01283, EMG0021, SRV0094)",
        "description": "Treatment/Drug description with full details",
        "qty": "Quantity (e.g., 1, 2)",
        "estAmt": "Estimated amount (e.g., 140.00, 175.00)",
        "apprAmt": "Approved amount (e.g., 140.00, 175.00, 240.00)",
        "status": "Approved/Partial Approved/Rejected",
        "remarks": "Approval remarks or additional info (e.g., 'Additional Info Required-- approved for LAB00231'). Use '-' if no remarks"
      }
    ]
  },
  "Checklist": {
    "ClaimForm": [
      {"id": "cf1", "title": "EMR Details and Final Diagnosis Filled", "status": "pass/fail", "reason": "Specific reason if failed"},
      {"id": "cf2", "title": "Diagnosis Requires Pre-Approval", "status": "pass/fail", "reason": "Pre-approval missing or not required"},
      {"id": "cf3", "title": "Service Charges Require Approval", "status": "pass/fail", "reason": "Unapproved services found"},
      {"id": "cf4", "title": "Total Claim Value Above Policy Threshold", "status": "pass/fail", "reason": "Threshold check"},
      {"id": "cf5", "title": "Approval Availability", "status": "pass/fail", "reason": "Approval document missing"}
    ],
    "Approval": [
      {"id": "ap1", "title": "Approval Document Present", "status": "pass/fail", "reason": "Missing approval code"},
      {"id": "ap2", "title": "Approval Lines Match Claim Form", "status": "pass/fail", "reason": "Service X in claim but not in approval"},
      {"id": "ap3", "title": "Partial or Rejected Services Check", "status": "pass/fail", "reason": "Partial approval found: [service names]"}
    ],
    "Invoice": [
      {"id": "inv1", "title": "Invoice Matches Approved Items and Amounts", "status": "pass/fail", "reason": "Amount mismatch for [service]"},
      {"id": "inv2", "title": "Discounts or Deductible Applied Correctly", "status": "pass/fail", "reason": "Incorrect discount calculation"},
      {"id": "inv3", "title": "Submission Date Within 60-day Limit", "status": "pass/fail", "reason": "Late submission: X days"}
    ],
    "Investigation": [
      {"id": "iv1", "title": "Investigations in Approval vs Invoice Match", "status": "pass/fail", "reason": "Lab test [name] in approval but not in invoice"},
      {"id": "iv2", "title": "No Duplicate or Missing Entries", "status": "pass/fail", "reason": "Duplicate: [test name]"}
    ]
  }
}

CRITICAL EXTRACTION RULES:
1. Extract EVERY field from ALL documents - claim form, invoice, approval
2. For invoice items: Extract ALL line items with EXACT details from the invoice table:
   - "no": Sequential row number from invoice (1, 2, 3, 4, 5...)
   - "date": Service date from "Service" column (DD/MM/YYYY format, e.g., "19/07/2025")
   - "code": Service code from "Service" column (e.g., "CON0065", "LAB01283", "MED040154")
   - "description": Full service name from "Service Name" column
   - "qty": Quantity from "QTY" column (as string like "1.00", "2.00")
   - "dv": D.V amount from "D.V" column (e.g., "500.00", "140.00", "10.10")
   - "ndv": N.D.V amount from "N.D.V" column (may be "-" or empty if not applicable)
   - "totalInvoice": Total Invoice from "Total Invoice" column (e.g., "500.00", "140.00", "10.10")
   - "guestShare": Guest Share from "Guest Share" column (e.g., "50.00", "-")
   - "companyDiscount": Company Discount from "Company Discount" column (negative values like "(115.00)", "(32.20)", or "-")
   - "companyShare": Company Share from "Company Share" column (e.g., "335.00", "107.80", "10.10")
   
   EXAMPLE from invoice table:
   Row 1: no="1", date="19/07/2025", code="CON0065", description="Initial Emergency Services", qty="1.00", dv="500.00", ndv="-", totalInvoice="500.00", guestShare="50.00", companyDiscount="(115.00)", companyShare="335.00"
   Row 2: no="2", date="19/07/2025", code="MED040154", description="PARACETAMOL KABI 10MG/ML IV, 100ML - V100C", qty="1.00", dv="-", ndv="10.10", totalInvoice="10.10", guestShare="-", companyDiscount="-", companyShare="10.10"
3. For approval items: Extract ALL approved/partial/rejected services with EXACT details:
   - Treatment/Drug Code (e.g., LAB01283, EMG0021, SRV0094, CON0065)
   - Full Treatment/Drug Description
   - Quantity
   - Estimated Amount (Est Amt)
   - Approved Amount (Appr.Amt)
   - Status (Approved/Partial Approved/Rejected)
   - Remarks (any additional info or notes, use "-" if none)
4. For financial summary at bottom of invoice: Extract from the "Total Invoice" and "Guest"/"Company" sections:
   - "totalInvoice": Total from bottom row (e.g., "2,198.10")
   - "grossAmount": Gross Amount from bottom (e.g., "2,148.10")
   - "companyDiscount": Com. Discount from bottom (e.g., "(496.80)")
   - "finTRS": Fin. TRS value (may be "-")
   - "guestPayments": Payments from Guest section (e.g., "(50.00)")
   - "refunds": Refunds value (may be "-")
   - "amountDue": Amount Due from bottom (e.g., "1,651.30")
   - "companyShare": Company Gross Amount (e.g., "1,857.00")
5. Preserve EXACT codes, amounts, dates, and descriptions from the document
6. For amounts: Keep decimal format (e.g., 140.00, 175.00, 50.00)
7. For negative amounts: Use parentheses format (e.g., (115.00), (46.00))
8. If field not found in document, use "-", never leave blank
9. IMPORTANT: Look carefully at the invoice table - each row has multiple columns. Extract ALL column values for each row.

CHECKLIST VALIDATION RULES (Based on Flowchart):
CLAIM FORM CHECKS:
- CF1: PASS if doctor name, diagnosis, clinical findings present. FAIL if missing EMR or diagnosis
- CF2: PASS if diagnosis doesn't need approval OR approval exists. FAIL if diagnosis needs approval but missing
- CF3: PASS if all services in claim are in approval. FAIL if unapproved services found
- CF4: Check if total amount exceeds policy threshold (if specified)
- CF5: PASS if approval document exists. FAIL if approval required but missing

APPROVAL CHECKS:
- AP1: PASS if pre-approval code exists. FAIL if missing
- AP2: PASS if all claim services are in approval. FAIL if mismatch found
- AP3: PASS if no partial/rejected services OR justified. FAIL if partial approval without justification

INVOICE CHECKS:
- INV1: PASS if invoice amounts match approval amounts. FAIL if mismatch (compare line by line)
- INV2: PASS if discounts/deductibles correctly applied. FAIL if calculation error
- INV3: PASS if invoice date within 60 days of service date. FAIL if late

INVESTIGATION CHECKS:
- IV1: PASS if all lab/radiology in approval are in invoice. FAIL if missing or extra
- IV2: PASS if no duplicate tests. FAIL if same test appears multiple times

For each FAIL, provide specific reason with service names, codes, or amounts.`;
  
  const user = `Medical claim documents text (contains Claim Form, Invoice, and Approval documents):

CRITICAL INSTRUCTIONS FOR TABLE EXTRACTION:

1. INVOICE TABLE: Look for rows with pattern like "10 19/07/2025 LAB01186 Stool, Ova & Parasite-Concentration Method 1.00 150.00 150.00 - (34.50) 115.50"
   - Each row has: No | Date | Code | Service Name | QTY | D.V | N.D.V | Total Invoice | Guest Share | Company Discount | Company Share
   - Extract EVERY number and value from EVERY column
   - If a column shows "-" or is empty in the PDF, use "-" in JSON
   - If a column has a value, extract it EXACTLY (e.g., "150.00", "(34.50)", "1.00")

2. APPROVAL TABLE: Look for rows with pattern like "LAB01283 CBC with Platelet Count & Automated Differential 1 140.00 140.00 Approved"
   - Each row has: Code | Description | Qty | Est Amt | Appr.Amt | Status | Remarks
   - Extract ALL values including status (Approved/Partial Approved/Rejected)
   - If remarks exist (like "Additional Info Required--"), include them

3. SCAN THE TEXT LINE BY LINE: Tables are often extracted as continuous text. Look for patterns:
   - Numbers followed by dates (DD/MM/YYYY)
   - Service codes (LAB, MED, CON, SRV, EMG followed by numbers)
   - Amounts in format XX.XX or (XX.XX) for negatives

Document text:
${String(combinedText).slice(0, 120000)}`;

  try {
    let content;
    if (client) {
      console.log('Calling OpenAI with', combinedText.length, 'chars of text...');
      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
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
      
      // Parse and log extracted data for debugging
      try {
        const parsed = JSON.parse(content);
        console.log('\n=== EXTRACTED DATA SUMMARY ===');
        console.log('Invoice items count:', parsed.Invoice?.items?.length || 0);
        if (parsed.Invoice?.items?.length > 0) {
          console.log('First invoice item:', JSON.stringify(parsed.Invoice.items[0], null, 2));
        }
        console.log('Financial Summary:', JSON.stringify(parsed.Invoice?.financialSummary, null, 2));
        console.log('Approval items count:', parsed.Approval?.approvals?.length || 0);
        if (parsed.Approval?.approvals?.length > 0) {
          console.log('First approval item:', JSON.stringify(parsed.Approval.approvals[0], null, 2));
        }
        console.log('==============================\n');
      } catch (e) {
        console.log('Could not parse response for logging:', e.message);
      }
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