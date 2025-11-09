import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import uploadHandler from './upload.js';
import validateHandler from './validate.js';
import { listClaims, getClaim, createClaim } from './claims.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/upload', (req, res) => uploadHandler(req, res));
app.post('/api/validate', (req, res) => validateHandler(req, res));

app.get('/api/claims', (req, res) => listClaims(req, res));
app.get('/api/claims/:id', (req, res) => getClaim(req, res));
app.post('/api/claims', (req, res) => createClaim(req, res));

app.listen(PORT, () => {
  console.log(`API at http://localhost:${PORT}`);
});