const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");

// Admin credentials (preserved)
const adminCredentials = {
  email: "admin@spist.edu",
  password: "admin123",
};

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check for admin login first
  if (
    email === adminCredentials.email &&
    password === adminCredentials.password
  ) {
    return res.json({
      success: true,
      userRole: "admin",
    });
  }

  // Check student login
  const query = "SELECT * FROM students WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const student = results[0];
    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      userRole: "student",
      studentId: student.id,
    });
  });
});

// Signup route
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  // Check if email already exists
  const checkQuery = "SELECT * FROM students WHERE email = ?";
  db.query(checkQuery, [email], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student
    const insertQuery =
      "INSERT INTO students (fullname, email, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [fullname, email, hashedPassword], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error creating account" });
      }

      res.json({
        success: true,
        message: "Account created successfully",
      });
    });
  });
});

module.exports = router;
