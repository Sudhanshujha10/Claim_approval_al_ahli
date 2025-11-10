# PDF Parser Microservice

Python microservice using Docling for accurate PDF table extraction.

## Setup

1. Create virtual environment:
```bash
cd python-parser
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python app.py
```

The service will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Parse Single PDF
```
POST /parse-pdf
Content-Type: multipart/form-data
Body: file=<pdf-file>
```

### Parse Multiple PDFs
```
POST /parse-multiple
Content-Type: multipart/form-data
Body: files=<pdf-file1>, files=<pdf-file2>, ...
```

## Response Format

```json
{
  "ok": true,
  "filename": "invoice.pdf",
  "documentType": "Invoice",
  "tables": [
    {
      "headers": ["No", "Date", "Code", "Service Name", "QTY", "D.V", "N.D.V", ...],
      "rows": [
        ["1", "19/07/2025", "CON0065", "Initial Emergency Services", "1.00", "500.00", ...],
        ...
      ]
    }
  ],
  "text": "Full extracted text...",
  "metadata": {
    "filename": "invoice.pdf",
    "documentType": "Invoice",
    "pageCount": 2
  }
}
```
