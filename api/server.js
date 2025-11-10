import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import uploadHandler from './upload.js';
import validateHandler from './validate.js';
import uploadDoclingHandler from './upload-docling.js';
import validateDoclingHandler from './validate-docling.js';
import { listClaims, getClaim, createClaim } from './claims.js';
import { getAdminConfig, updateServices, updateDiagnosisCodes, updateCoverageExceptions } from './admin-config.js';
import revalidateHandler from './revalidate.js';
import updateChecklistHandler from './update-checklist.js';
import filesHandler from './files.js';
import approveClaimHandler from './approve-claim.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Original endpoints (using pdfjs-dist)
app.post('/api/upload', (req, res) => uploadHandler(req, res));
app.post('/api/validate', (req, res) => validateHandler(req, res));

// New endpoints (using Python Docling microservice)
app.post('/api/upload-docling', (req, res) => uploadDoclingHandler(req, res));
app.post('/api/validate-docling', (req, res) => validateDoclingHandler(req, res));

app.get('/api/claims', (req, res) => listClaims(req, res));
app.get('/api/claims/:id', (req, res) => getClaim(req, res));
app.post('/api/claims', (req, res) => createClaim(req, res));

// Admin Configuration endpoints
app.get('/api/admin/config', (req, res) => getAdminConfig(req, res));
app.post('/api/admin/services', (req, res) => updateServices(req, res));
app.post('/api/admin/diagnosis-codes', (req, res) => updateDiagnosisCodes(req, res));
app.post('/api/admin/coverage-exceptions', (req, res) => updateCoverageExceptions(req, res));

// Revalidation endpoint
app.post('/api/revalidate', (req, res) => revalidateHandler(req, res));

// Update checklist endpoint
app.post('/api/update-checklist', (req, res) => updateChecklistHandler(req, res));

// Approve claim endpoint
app.post('/api/approve-claim', (req, res) => approveClaimHandler(req, res));

// File server endpoint for PDF preview
app.get('/api/files/:filename', (req, res) => filesHandler(req, res));

app.listen(PORT, () => {
  console.log(`API at http://localhost:${PORT}`);
});