const express = require("express");
const router = express.Router();
const db = require("../config/database");

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const SELECT_STUDENT_FIELDS = `
  SELECT id, student_id, fullname, email, department,
         year_level, student_type, contact_number, status
  FROM students
`;

router.get("/", async (req, res) => {
  try {
    const query = `${SELECT_STUDENT_FIELDS} ORDER BY student_id ASC`;
    const students = await executeQuery(query);
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:studentId", async (req, res) => {
  try {
    const query = `${SELECT_STUDENT_FIELDS} WHERE student_id = ?`;
    const students = await executeQuery(query, [req.params.studentId]);

    if (students.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(students[0]);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
