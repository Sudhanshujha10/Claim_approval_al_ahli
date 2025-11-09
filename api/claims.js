// api/claims.js
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'api', '_data');
const dataFile = path.join(dataDir, 'claims.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ claims: [] }, null, 2));
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf-8');
  try {
    const json = JSON.parse(raw || '{"claims":[]}');
    return Array.isArray(json.claims) ? json.claims : [];
  } catch {
    return [];
  }
}

function writeAll(claims) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify({ claims }, null, 2));
}

export function listClaims(req, res) {
  try {
    const claims = readAll();
    return res.json({ ok: true, claims });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}

export function getClaim(req, res) {
  try {
    const { id } = req.params;
    const claims = readAll();
    const claim = claims.find((c) => String(c.id) === String(id));
    if (!claim) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true, claim });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}

export function createClaim(req, res) {
  try {
    const { claim } = req.body || {};
    if (!claim || !claim.id) return res.status(400).json({ ok: false, error: 'claim with id is required' });

    console.log('Creating claim:', claim.id);
    const claims = readAll();
    const idx = claims.findIndex((c) => String(c.id) === String(claim.id));
    if (idx >= 0) {
      console.log('Updating existing claim');
      claims[idx] = { ...claims[idx], ...claim };
    } else {
      console.log('Adding new claim');
      claims.unshift({ ...claim });
    }
    writeAll(claims);
    console.log('Saved to', dataFile, '- Total claims:', claims.length);
    return res.json({ ok: true, claim });
  } catch (e) {
    console.error('createClaim error:', e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
