-- ============================================
-- CONTEXT & JURISDICTION
-- ============================================
CREATE TABLE IF NOT EXISTS jurisdictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HAZARD LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS hazards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  pre_control_risk INTEGER DEFAULT 0, -- 1-25 scale
  post_control_risk INTEGER DEFAULT 0,
  industry_id INTEGER,
  jurisdiction_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (industry_id) REFERENCES industries(id),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

-- ============================================
-- CONTROL LIBRARY
-- ============================================
CREATE TABLE IF NOT EXISTS controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- Training, Document, Verification, PPE, Legislation, etc.
  description TEXT,
  reference TEXT, -- e.g., "AS/NZS 4836"
  validity_days INTEGER, -- NULL = no expiry
  recurrence_days INTEGER, -- for recurring checks
  metadata TEXT, -- JSON for flexible properties
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HAZARD-CONTROL MAPPING
-- ============================================
CREATE TABLE IF NOT EXISTS hazard_controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hazard_id INTEGER NOT NULL,
  control_id INTEGER NOT NULL,
  is_critical BOOLEAN DEFAULT 0,
  priority INTEGER DEFAULT 0,
  FOREIGN KEY (hazard_id) REFERENCES hazards(id) ON DELETE CASCADE,
  FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE,
  UNIQUE(hazard_id, control_id)
);

-- ============================================
-- ENTITIES (Organizations, Clients, Workers)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry_id INTEGER,
  jurisdiction_id INTEGER,
  logo_path TEXT,
  primary_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (industry_id) REFERENCES industries(id),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  site_name TEXT,
  additional_hazards TEXT, -- JSON array of hazard IDs
  branding TEXT, -- JSON for client-specific branding
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  company_id INTEGER,
  activity_package TEXT, -- JSON array of activities
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Role-Hazard mapping (what hazards apply to this role)
CREATE TABLE IF NOT EXISTS role_hazards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL,
  hazard_id INTEGER NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (hazard_id) REFERENCES hazards(id) ON DELETE CASCADE,
  UNIQUE(role_id, hazard_id)
);

CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id INTEGER NOT NULL,
  role_id INTEGER,
  status TEXT DEFAULT 'active', -- active, inactive, terminated
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Worker-Client assignments
CREATE TABLE IF NOT EXISTS worker_clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================
-- EVIDENCE & COMPLIANCE
-- ============================================
CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  control_id INTEGER NOT NULL,
  evidence_type TEXT NOT NULL, -- certificate, signature, inspection, attendance
  status TEXT DEFAULT 'valid', -- valid, expired, pending, invalid
  issued_date DATE,
  expiry_date DATE,
  file_path TEXT,
  notes TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE
);

-- ============================================
-- INCIDENTS & OUTCOMES
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  client_id INTEGER,
  incident_date DATETIME NOT NULL,
  severity TEXT, -- minor, serious, critical, fatality
  category TEXT, -- injury, near-miss, property-damage
  description TEXT,
  hazard_ids TEXT, -- JSON array
  failed_control_ids TEXT, -- JSON array
  hours_exposure INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- ACTIONS & TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id INTEGER,
  due_date DATE,
  status TEXT DEFAULT 'open', -- open, in-progress, closed
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  linked_hazard_id INTEGER,
  linked_control_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  FOREIGN KEY (assignee_id) REFERENCES workers(id),
  FOREIGN KEY (linked_hazard_id) REFERENCES hazards(id),
  FOREIGN KEY (linked_control_id) REFERENCES controls(id)
);

-- ============================================
-- SCORING & ANALYTICS CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS risk_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- company, client, worker
  entity_id INTEGER NOT NULL,
  score_date DATE NOT NULL,
  rbcs_score REAL,
  coverage_score REAL,
  quality_score REAL,
  effectiveness_score REAL,
  velocity_score REAL,
  metadata TEXT, -- JSON with breakdown
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_hazards_industry ON hazards(industry_id);
CREATE INDEX IF NOT EXISTS idx_hazards_jurisdiction ON hazards(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_workers_company ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_workers_role ON workers(role_id);
CREATE INDEX IF NOT EXISTS idx_evidence_worker ON evidence(worker_id);
CREATE INDEX IF NOT EXISTS idx_evidence_control ON evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence(status);
CREATE INDEX IF NOT EXISTS idx_incidents_company ON incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_actions_assignee ON actions(assignee_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);

