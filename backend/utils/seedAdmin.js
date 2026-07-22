
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../models/db");

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || "Super Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@placementportal.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = db.findOne("users", (u) => u.email === email);
  if (existing) {
    console.log(`Admin already exists with email: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.insert("users", { name, email, password: hashedPassword, role: "admin" });

  console.log("Admin account created successfully!");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("You can now log in on the website with these credentials.");
}

seedAdmin();
