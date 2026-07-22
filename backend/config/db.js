// Simple file-based JSON database.
// This avoids the need to install/run MongoDB, MySQL, etc. All data
// lives in backend/data/db.json and is read/written safely on every request.

const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "..", "data", "db.json");

// Shape of the database
const DEFAULT_DATA = {
  users: [],        // { id, name, email, password(hashed), role: 'admin'|'company'|'student', createdAt }
  companies: [],     // { id, userId, companyName, industry, location, website, description, requirements, status: 'pending'|'approved'|'rejected', createdAt }
  students: [],      // { id, userId, course, branch, cgpa, skills, phone, resumePath, resumeOriginalName, createdAt }
  applications: []   // { id, studentId, companyId, status: 'applied'|'approved'|'rejected', appliedAt }
};

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    // If file got corrupted somehow, reset it rather than crash the server
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDb, writeDb, ensureDbFile, DB_FILE };
