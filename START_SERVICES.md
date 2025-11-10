# Start Services - Exact Commands

## Step 1: Setup Python Service (One-time)

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval/python-parser
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install flask flask-cors python-dotenv pdfplumber tabulate
```

## Step 2: Start Python Service (Terminal 1)

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval/python-parser
source venv/bin/activate
python app.py
```

**Expected output:**
```
Starting PDF Parser Service on port 5001
 * Running on http://0.0.0.0:5001
```

**Note:** Using port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000

## Step 3: Start Node.js Backend (Terminal 2)

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval
node api/server.js
```

**Expected output:**
```
API at http://localhost:3001
```

## Step 4: Start Frontend (Terminal 3)

```bash
cd /Users/sudhanshukumarjha/Downloads/QLM\ Claims\ Approval
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:3007/
```

## Quick Test

Test Python service:
```bash
curl http://localhost:5001/health
```

Should return: `{"service":"pdf-parser","status":"ok"}`

## Notes

- Python service uses **pdfplumber** instead of Docling (Python 3.13 compatibility)
- pdfplumber is excellent for table extraction and works reliably
- All three services must be running simultaneously
