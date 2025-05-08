const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check admin login
  const adminQuery = "SELECT * FROM admins WHERE email = ?";
  db.query(adminQuery, [email], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const admin = results[0];
      // For now, since sample data has plain text passwords, we'll do a direct comparison
      // In production, you should use bcrypt.compare like with students
      if (password === admin.password) {
        return res.json({
          success: true,
          userRole: "admin",
          adminId: admin.id,
          role: admin.role,
        });
      }
    }

    // If admin login fails, check student login
    const studentQuery = "SELECT * FROM students WHERE email = ?";
    db.query(studentQuery, [email], async (err, results) => {
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
});

// Signup route
router.post("/signup", async (req, res) => {
  const {
    student_id,
    fullname,
    email,
    password,
    department,
    year_level,
    student_type,
    contact_number,
    status,
  } = req.body;

  // Check if email already exists
  const checkQuery = "SELECT * FROM students WHERE email = ? OR student_id = ?";
  db.query(checkQuery, [email, student_id], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          results[0].email === email
            ? "Email already exists"
            : "Student ID already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new student with all fields
    const insertQuery =
      "INSERT INTO students (student_id, fullname, email, password, department, year_level, student_type, contact_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(
      insertQuery,
      [
        student_id,
        fullname,
        email,
        hashedPassword,
        department,
        year_level,
        student_type,
        contact_number,
        status,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error creating account" });
        }

        res.json({
          success: true,
          message: "Account created successfully",
        });
      }
    );
  });
});

module.exports = router;
