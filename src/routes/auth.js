const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");

const queryDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const authenticateAdmin = async (email, password) => {
  const adminResults = await queryDB("SELECT * FROM admins WHERE email = ?", [
    email,
  ]);

  if (adminResults.length === 0) return null;

  const admin = adminResults[0];
  const passwordMatch = await bcrypt.compare(password, admin.password);

  return passwordMatch ? admin : null;
};

const authenticateStudent = async (email, password) => {
  const studentResults = await queryDB(
    "SELECT * FROM students WHERE email = ?",
    [email]
  );

  if (studentResults.length === 0) return null;

  const student = studentResults[0];
  const passwordMatch = await bcrypt.compare(password, student.password);

  return passwordMatch ? student : null;
};

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await authenticateAdmin(email, password);
    if (admin) {
      return res.json({
        success: true,
        userRole: "admin",
        adminId: admin.id,
        role: admin.role,
      });
    }

    const student = await authenticateStudent(email, password);
    if (student) {
      return res.json({
        success: true,
        userRole: "student",
        studentId: student.id,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
});

const checkExistingStudent = async (email, studentId) => {
  const existingUser = await queryDB(
    "SELECT * FROM students WHERE email = ? OR student_id = ?",
    [email, studentId]
  );

  if (existingUser.length > 0) {
    const message =
      existingUser[0].email === email
        ? "Email already exists"
        : "Student ID already exists";
    return { exists: true, message };
  }

  return { exists: false };
};

router.post("/signup", async (req, res) => {
  try {
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

    const existingCheck = await checkExistingStudent(email, student_id);
    if (existingCheck.exists) {
      return res.status(400).json({
        success: false,
        message: existingCheck.message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO students (
        student_id, fullname, email, password, 
        department, year_level, student_type, 
        contact_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await queryDB(insertQuery, [
      student_id,
      fullname,
      email,
      hashedPassword,
      department,
      year_level,
      student_type,
      contact_number,
      status,
    ]);

    res.json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating account",
    });
  }
});

module.exports = router;
