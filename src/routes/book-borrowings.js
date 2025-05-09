const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all borrowings for a student
router.get("/:studentId", (req, res) => {
  const query = `
    SELECT 
      bb.id as borrow_id,
      bb.book_id,
      bb.student_id,
      bb.borrow_date,
      bb.due_date,
      bb.return_date,
      bb.status as borrow_status,
      b.title,
      b.author,
      b.status as book_status
    FROM book_borrowings bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.student_id = ?
      AND (bb.status = 'borrowed' OR bb.status = 'overdue')
      AND bb.return_date IS NULL
    ORDER BY bb.due_date ASC
  `;

  db.query(query, [req.params.studentId], (err, borrowings) => {
    if (err) {
      console.error("Error fetching borrowings:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Format the response
    const response = {
      total_borrowed: borrowings.length,
      books: borrowings.map((b) => ({
        title: b.title,
        due_date: b.due_date,
        status: b.borrow_status,
      })),
    };

    console.log(`Borrowings for student ${req.params.studentId}:`, response);
    res.json(response);
  });
});

module.exports = router;
