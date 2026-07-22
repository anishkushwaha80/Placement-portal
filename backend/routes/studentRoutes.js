const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../models/db");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

function getStudentProfileByUserId(userId) {
  return db.findOne("students", (s) => s.userId === userId);
}

// ---------------------------------------------------------------------
// GET /api/student/me -> logged-in student's own profile
// ---------------------------------------------------------------------
router.get("/me", protect, authorize("student"), (req, res) => {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Student profile not found" });
  res.json(profile);
});

// ---------------------------------------------------------------------
// PUT /api/student/me -> update text details (course, branch, cgpa, skills, phone)
// ---------------------------------------------------------------------
router.put("/me", protect, authorize("student"), (req, res) => {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Student profile not found" });

  const { course, branch, cgpa, skills, phone } = req.body;

  const updated = db.updateById("students", profile.id, {
    course: course ?? profile.course,
    branch: branch ?? profile.branch,
    cgpa: cgpa ?? profile.cgpa,
    skills: skills ?? profile.skills,
    phone: phone ?? profile.phone,
  });

  res.json({ message: "Profile updated", student: updated });
});

// ---------------------------------------------------------------------
// POST /api/student/resume -> upload/replace resume PDF
// multipart/form-data field name: "resume"
// ---------------------------------------------------------------------
router.post("/resume", protect, authorize("student"), upload.single("resume"), (req, res) => {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Student profile not found" });

  if (!req.file) {
    return res.status(400).json({ message: "No resume file uploaded, or file was not a PDF" });
  }

  // Remove old resume file if one exists, to avoid orphaned files piling up
  if (profile.resumePath) {
    const oldPath = path.join(__dirname, "..", "uploads", profile.resumePath);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const updated = db.updateById("students", profile.id, {
    resumePath: req.file.filename,
    resumeOriginalName: req.file.originalname,
  });

  res.json({ message: "Resume uploaded successfully", student: updated });
});

// ---------------------------------------------------------------------
// POST /api/student/apply/:companyId -> apply to an approved company
// ---------------------------------------------------------------------
router.post("/apply/:companyId", protect, authorize("student"), (req, res) => {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Student profile not found" });

  if (!profile.resumePath) {
    return res.status(400).json({ message: "Please upload your resume before applying" });
  }

  const company = db.findById("companies", req.params.companyId);
  if (!company || company.status !== "approved") {
    return res.status(404).json({ message: "Company not found or not approved yet" });
  }

  const alreadyApplied = db.findOne(
    "applications",
    (a) => a.studentId === profile.id && a.companyId === company.id
  );
  if (alreadyApplied) {
    return res.status(409).json({ message: "You have already applied to this company" });
  }

  const application = db.insert("applications", {
    studentId: profile.id,
    companyId: company.id,
    status: "applied",
    appliedAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Application submitted", application });
});

// ---------------------------------------------------------------------
// GET /api/student/applications -> this student's own applications with company info
// ---------------------------------------------------------------------
router.get("/applications", protect, authorize("student"), (req, res) => {
  const profile = getStudentProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Student profile not found" });

  const applications = db.findMany("applications", (a) => a.studentId === profile.id);

  const enriched = applications.map((app) => {
    const company = db.findById("companies", app.companyId);
    return {
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      company: company
        ? {
            id: company.id,
            companyName: company.companyName,
            industry: company.industry,
            location: company.location,
          }
        : null,
    };
  });

  res.json(enriched);
});

module.exports = router;
