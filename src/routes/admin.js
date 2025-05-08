const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get current admin information
router.get("/admin/:id", (req, res) => {
  const adminId = req.params.id;
  const query = "SELECT id, fullname, email, role FROM admins WHERE id = ?";

  db.query(query, [adminId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json(results[0]);
  });
});

// Get dashboard statistics
router.get("/dashboard/stats", (req, res) => {
  const queries = {
    totalBooks: "SELECT COUNT(*) as count FROM books",
    activeBorrowings:
      "SELECT COUNT(*) as count FROM book_borrowings WHERE status = 'active'",
    registeredStudents: "SELECT COUNT(*) as count FROM students",
    overdueBooks:
      "SELECT COUNT(*) as count FROM book_borrowings WHERE status = 'overdue'",
    // Get monthly borrowing trends for the last 6 months
    borrowingTrends: `
      SELECT 
        DATE_FORMAT(borrow_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM book_borrowings
      WHERE borrow_date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(borrow_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `,
    // Get popular book categories
    popularCategories: `
      SELECT 
        category,
        COUNT(*) as count
      FROM books
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `,
    // Get recent activities
    recentActivities: `
      (SELECT 
        'book_borrowed' as type,
        CONCAT(b.title, ' by ', s.fullname) as detail,
        bb.borrow_date as timestamp
      FROM book_borrowings bb
      JOIN books b ON bb.book_id = b.id
      JOIN students s ON bb.student_id = s.id
      WHERE bb.status = 'active'
      ORDER BY bb.borrow_date DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'book_returned' as type,
        CONCAT(b.title, ' by ', s.fullname) as detail,
        bb.return_date as timestamp
      FROM book_borrowings bb
      JOIN books b ON bb.book_id = b.id
      JOIN students s ON bb.student_id = s.id
      WHERE bb.status = 'returned' AND bb.return_date IS NOT NULL
      ORDER BY bb.return_date DESC
      LIMIT 5)
      UNION ALL
      (SELECT 
        'book_overdue' as type,
        CONCAT(b.title, ' by ', s.fullname) as detail,
        bb.due_date as timestamp
      FROM book_borrowings bb
      JOIN books b ON bb.book_id = b.id
      JOIN students s ON bb.student_id = s.id
      WHERE bb.status = 'overdue'
      ORDER BY bb.due_date DESC
      LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `,
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  // Execute each query
  Object.entries(queries).forEach(([key, query]) => {
    db.query(query, (err, results) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        stats[key] = null;
      } else {
        if (
          key === "borrowingTrends" ||
          key === "popularCategories" ||
          key === "recentActivities"
        ) {
          stats[key] = results;
        } else {
          stats[key] = results[0].count;
        }
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(stats);
      }
    });
  });
});

module.exports = router;
