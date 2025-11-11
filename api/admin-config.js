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
      servicesRequiringApproval: [
        { code: "PST0002", name: "Physiotherapy - Regular Visit at (AAH)" },
        { code: "PST0001", name: "Physiotherapy - Initial Assessment at (AAH)" },
        { code: "VCN0011", name: "M.M.R VAC. LIVE 0.5ML - (PRIORIX)" },
        { code: "VCN0021", name: "Diphtheria/Pertussis/Tetanus+HepatitisB+Hib (Penta Vaccine)" },
        { code: "ENT0004", name: "Ear Wash /Cleaning - two sides" },
        { code: "SRG0023", name: "Ingrowing Toe nail removal under LA" },
        { code: "CTSX0023", name: "Radiology - CT Brain + Sinuses (Without Contrast)" },
        { code: "CTSX0003", name: "Radiology - CT Abdomen + Pelvis (Without Contrast)" },
        { code: "CTSX0011", name: "Radiology - CT Angiogram Pulmonary" },
        { code: "CTSX0020", name: "Radiology - CT Brain (Without Contrast)" },
        { code: "CTSX0025", name: "Radiology - CT Cardiac" },
        { code: "MRIX0018", name: "Radiology - MRI Brain" },
        { code: "MRIX0081", name: "Radiology - MRI Spine (Lumbar)" },
        { code: "MRIX0078", name: "Radiology - MRI Spine (Cervical)" },
        { code: "MRIX0053", name: "Radiology - MRI Knee (Right + Left)" },
        { code: "MRIX0022", name: "Radiology - MRI Cardiac (With Contrast)" },
        { code: "DNT2000", name: "Removal of plaque and or stain" },
        { code: "DNT1000", name: "Comprehensive Oral Examination" },
        { code: "DNT1005", name: "Orthopantomographia - OPG" }
      ],
      diagnosisCodesRequiringApproval: [
        { code: "Z00.00", description: "Encntr For General Adult Medical Exam W/O Abnormal Findings" },
        { code: "O09.91", description: "Supervision Of High Risk Pregnancy, Unsp, First Trimester" },
        { code: "O09.42", description: "Suprvsn Of Grand Multiparity, Second Trimester" },
        { code: "O21.0", description: "Mild hyperemesis gravidarum" },
        { code: "O60.02", description: "Preterm Labor Without Delivery, Second Trimester" },
        { code: "Z3A.24", description: "24 Weeks Gestation Of Pregnancy" },
        { code: "Z3A.36", description: "36 Weeks Gestation Of Pregnancy" },
        { code: "F41.9", description: "Anxiety disorder, unspecified" },
        { code: "F41.3", description: "Other mixed anxiety disorders" },
        { code: "F32.1", description: "Moderate depressive episode" },
        { code: "K02.62", description: "Dental Caries On Smooth Surface Penetrating Into Dentin" },
        { code: "K02.9", description: "Dental caries, unspecified" },
        { code: "K02.52", description: "Dental Caries On Pit And Fissure Surface Penetrating Into Dentin" },
        { code: "K02.9", description: "Dental caries, unspecified" },
        { code: "Z3A.36", description: "36 Weeks Gestation Of Pregnancy" }
      ],
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
