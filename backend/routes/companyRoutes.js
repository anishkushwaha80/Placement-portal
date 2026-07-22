const express = require("express");
const db = require("../models/db");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

function getCompanyProfileByUserId(userId) {
  return db.findOne("companies", (c) => c.userId === userId);
}

// ---------------------------------------------------------------------
// GET /api/company/me  -> the logged-in company's own profile
// ---------------------------------------------------------------------
router.get("/me", protect, authorize("company"), (req, res) => {
  const profile = getCompanyProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Company profile not found" });
  res.json(profile);
});

// ---------------------------------------------------------------------
// PUT /api/company/me -> update own company details + requirements
// body: { companyName, industry, location, website, description, requirements }
// Editing details resets status to 'pending' so admin can re-review changes,
// UNLESS the company was already approved (small changes shouldn't force
// re-approval) -- here we keep it simple: only NEW companies need approval.
// ---------------------------------------------------------------------
router.put("/me", protect, authorize("company"), (req, res) => {
  const profile = getCompanyProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Company profile not found" });

  const { companyName, industry, location, website, description, requirements } = req.body;

  const updated = db.updateById("companies", profile.id, {
    companyName: companyName ?? profile.companyName,
    industry: industry ?? profile.industry,
    location: location ?? profile.location,
    website: website ?? profile.website,
    description: description ?? profile.description,
    requirements: requirements ?? profile.requirements,
  });

  res.json({ message: "Company details updated", company: updated });
});

// ---------------------------------------------------------------------
// GET /api/company/applicants -> students who applied to this company
// ---------------------------------------------------------------------
router.get("/applicants", protect, authorize("company"), (req, res) => {
  const profile = getCompanyProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Company profile not found" });

  const applications = db.findMany("applications", (a) => a.companyId === profile.id);

  const enriched = applications.map((app) => {
    const student = db.findById("students", app.studentId);
    const studentUser = student ? db.findById("users", student.userId) : null;
    return {
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      student: student
        ? {
            id: student.id,
            name: studentUser?.name,
            email: studentUser?.email,
            course: student.course,
            branch: student.branch,
            cgpa: student.cgpa,
            skills: student.skills,
            phone: student.phone,
            resumeOriginalName: student.resumeOriginalName,
            resumePath: student.resumePath ? `/uploads/${student.resumePath}` : "",
          }
        : null,
    };
  });

  res.json(enriched);
});

// ---------------------------------------------------------------------
// PUT /api/company/applicants/:applicationId -> approve/reject a student
// body: { status: 'approved' | 'rejected' }
// ---------------------------------------------------------------------
router.put("/applicants/:applicationId", protect, authorize("company"), (req, res) => {
  const profile = getCompanyProfileByUserId(req.user.id);
  if (!profile) return res.status(404).json({ message: "Company profile not found" });

  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
  }

  const application = db.findById("applications", req.params.applicationId);
  if (!application || application.companyId !== profile.id) {
    return res.status(404).json({ message: "Application not found" });
  }

  const updated = db.updateById("applications", application.id, { status });
  res.json({ message: `Applicant ${status}`, application: updated });
});

// ---------------------------------------------------------------------
// GET /api/company/list -> public-ish list of APPROVED companies
// (used by students to browse and apply). Any logged-in user can call this.
// ---------------------------------------------------------------------
router.get("/list", protect, (req, res) => {
  const approved = db.findMany("companies", (c) => c.status === "approved");
  res.json(approved);
});

module.exports = router;
