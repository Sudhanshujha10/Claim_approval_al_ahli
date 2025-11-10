// api/admin-config.js - Admin Configuration Management
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'admin-config.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize config file if it doesn't exist
function initConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      servicesRequiringApproval: [],
      diagnosisCodesRequiringApproval: [],
      coverageExceptions: []
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  }
}

// Read config
function getConfig() {
  initConfig();
  const data = fs.readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(data);
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// API Handlers
export async function getAdminConfig(req, res) {
  try {
    const config = getConfig();
    return res.json({ ok: true, config });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}

export async function updateServices(req, res) {
  try {
    const { services } = req.body;
    const config = getConfig();
    config.servicesRequiringApproval = services;
    saveConfig(config);
    return res.json({ ok: true, config });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}

export async function updateDiagnosisCodes(req, res) {
  try {
    const { codes } = req.body;
    const config = getConfig();
    config.diagnosisCodesRequiringApproval = codes;
    saveConfig(config);
    return res.json({ ok: true, config });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}

export async function updateCoverageExceptions(req, res) {
  try {
    const { exceptions } = req.body;
    const config = getConfig();
    config.coverageExceptions = exceptions;
    saveConfig(config);
    return res.json({ ok: true, config });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message) });
  }
}
