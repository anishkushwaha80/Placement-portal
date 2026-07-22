const express = require("express");
const db = require("../models/db");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes below require a logged-in ADMIN
router.use(protect, authorize("admin"));

// ---------------------------------------------------------------------
// GET /api/admin/stats -> quick counts for the dashboard header
// ---------------------------------------------------------------------
router.get("/stats", (req, res) => {
  const companies = db.all("companies");
  const students = db.all("students");
  const applications = db.all("applications");

  res.json({
    totalStudents: students.length,
    totalCompanies: companies.length,
    pendingCompanies: companies.filter((c) => c.status === "pending").length,
    approvedCompanies: companies.filter((c) => c.status === "approved").length,
    totalApplications: applications.length,
    approvedApplications: applications.filter((a) => a.status === "approved").length,
  });
});

// ---------------------------------------------------------------------
// GET /api/admin/companies -> every company with its account email + status
// ---------------------------------------------------------------------
router.get("/companies", (req, res) => {
  const companies = db.all("companies").map((c) => {
    const user = db.findById("users", c.userId);
    return { ...c, email: user?.email, accountName: user?.name };
  });
  res.json(companies);
});

// ---------------------------------------------------------------------
// PUT /api/admin/companies/:id -> approve or reject a company
// body: { status: 'approved' | 'rejected' }
// ---------------------------------------------------------------------
router.put("/companies/:id", (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const company = db.findById("companies", req.params.id);
  if (!company) return res.status(404).json({ message: "Company not found" });

  const updated = db.updateById("companies", company.id, { status });
  res.json({ message: `Company ${status}`, company: updated });
});

// ---------------------------------------------------------------------
// GET /api/admin/students -> every student with account email
// ---------------------------------------------------------------------
router.get("/students", (req, res) => {
  const students = db.all("students").map((s) => {
    const user = db.findById("users", s.userId);
    return {
      ...s,
      email: user?.email,
      accountName: user?.name,
      resumePath: s.resumePath ? `/uploads/${s.resumePath}` : "",
    };
  });
  res.json(students);
});

// ---------------------------------------------------------------------
// GET /api/admin/applications -> every application, showing which student
// got approved in which company (the core "who got placed where" view)
// ---------------------------------------------------------------------
router.get("/applications", (req, res) => {
  const applications = db.all("applications").map((app) => {
    const student = db.findById("students", app.studentId);
    const studentUser = student ? db.findById("users", student.userId) : null;
    const company = db.findById("companies", app.companyId);

    return {
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      studentName: studentUser?.name || "Unknown",
      studentEmail: studentUser?.email || "",
      companyName: company?.companyName || "Unknown",
    };
  });

  res.json(applications);
});

module.exports = router;
