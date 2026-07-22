require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { ensureDbFile } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const studentRoutes = require("./routes/studentRoutes");

ensureDbFile();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded resumes statically so the frontend / admin can view/download them
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Placement Portal API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/student", studentRoutes);

// Basic error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server connect http://localhost:${PORT}`);
});
