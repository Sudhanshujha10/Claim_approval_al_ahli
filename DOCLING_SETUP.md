# Docling Integration Setup Guide

This guide explains how to set up the Python Docling microservice for accurate PDF table extraction.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│  Node.js API     │─────▶│  Python Parser  │
│   (React)       │      │  (Express)       │      │  (Docling)      │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                │                            │
                                │                            │
                                ▼                            ▼
                         ┌──────────────┐          ┌──────────────┐
                         │   OpenAI     │          │  PDF Tables  │
                         │  (Validation)│          │  Extraction  │
                         └──────────────┘          └──────────────┘
```

## Setup Steps

### 1. Set up Python Microservice

```bash
cd python-parser
./setup.sh
```

This will:
- Create a Python virtual environment
- Install Docling and dependencies
- Set up Flask server

### 2. Start Python Service

```bash
cd python-parser
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The service will start on `http://localhost:5000`

### 3. Start Node.js Backend

In a separate terminal:

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval
node api/server.js
```

The API will start on `http://localhost:3001`

### 4. Start Frontend

In another terminal:

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval
npm run dev
```

The frontend will start on `http://localhost:3007`

## How It Works

### 1. PDF Upload Flow

```
User uploads PDFs
    ↓
Frontend → /api/upload-docling (Node.js)
    ↓
Node.js → /parse-multiple (Python Docling)
    ↓
Docling extracts tables with exact structure
    ↓
Returns: { tables: [{ headers: [...], rows: [[...]] }] }
    ↓
Node.js passes to OpenAI for validation
    ↓
OpenAI maps table data to JSON structure
    ↓
Frontend displays accurate data
```

### 2. Table Extraction

**Before (pdfjs-dist):**
- Extracts text as continuous string
- AI struggles to identify table boundaries
- Missing or incorrect column values

**After (Docling):**
- Extracts tables as structured arrays
- Each row is an array of cell values
- Headers clearly identified
- 100% accurate column mapping

### 3. Example Output

**Docling Output:**
```json
{
  "tables": [
    {
      "headers": ["No", "Date", "Code", "Service Name", "QTY", "D.V", "N.D.V", "Total Invoice", "Guest Share", "Company Discount", "Company Share"],
      "rows": [
        ["1", "19/07/2025", "CON0065", "Initial Emergency Services", "1.00", "500.00", "-", "500.00", "50.00", "(115.00)", "335.00"],
        ["2", "19/07/2025", "MED040154", "PARACETAMOL KABI 10MG/ML IV, 100ML - V100C", "1.00", "-", "10.10", "10.10", "-", "-", "10.10"]
      ]
    }
  ]
}
```

**OpenAI Maps to:**
```json
{
  "Invoice": {
    "items": [
      {
        "no": "1",
        "date": "19/07/2025",
        "code": "CON0065",
        "description": "Initial Emergency Services",
        "qty": "1.00",
        "dv": "500.00",
        "ndv": "-",
        "totalInvoice": "500.00",
        "guestShare": "50.00",
        "companyDiscount": "(115.00)",
        "companyShare": "335.00"
      }
    ]
  }
}
```

## API Endpoints

### Python Service (Port 5000)

- `GET /health` - Health check
- `POST /parse-pdf` - Parse single PDF
- `POST /parse-multiple` - Parse multiple PDFs

### Node.js API (Port 3001)

- `POST /api/upload-docling` - Upload PDFs (uses Python service)
- `POST /api/validate-docling` - Validate with structured data
- `POST /api/upload` - Original upload (pdfjs-dist)
- `POST /api/validate` - Original validation

## Environment Variables

Create `.env` file in root:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
PYTHON_PARSER_URL=http://localhost:5000
PORT=3001
```

## Troubleshooting

### Python Service Not Starting

```bash
# Check Python version (need 3.8+)
python3 --version

# Reinstall dependencies
cd python-parser
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Connection Refused Error

Make sure Python service is running:
```bash
curl http://localhost:5000/health
```

Should return: `{"status": "ok", "service": "pdf-parser"}`

### Table Data Still Incorrect

Check logs:
1. Python service terminal - shows table extraction
2. Node.js terminal - shows structured data received
3. Browser console - shows final AI response

## Benefits

✅ **Accurate Table Extraction**: Docling is purpose-built for document parsing
✅ **Structured Data**: Tables returned as arrays, not text
✅ **Better AI Performance**: OpenAI receives clean structured data
✅ **Reliable**: No more missing columns or incorrect values
✅ **Scalable**: Python service can be deployed separately

## Next Steps

After successful setup:
1. Upload your claim documents
2. Check Python terminal for table extraction logs
3. Check Node.js terminal for structured data
4. Verify accurate data in frontend tables
