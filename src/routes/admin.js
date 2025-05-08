const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.use((req, res, next) => {
  console.log("Admin API Request:", {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });
  next();
});

router.get("/books", async (req, res) => {
  const query = `
    SELECT 
      b.id, b.title, b.author, b.isbn, b.category, 
      b.added_date, b.status,
      CASE 
        WHEN bb.id IS NOT NULL AND bb.status = 'active' THEN 'Borrowed'
        ELSE b.status
      END as current_status,
      bb.borrow_date, bb.due_date,
      s.fullname as borrowed_by
    FROM books b
    LEFT JOIN book_borrowings bb ON b.id = bb.book_id AND bb.status = 'active'
    LEFT JOIN students s ON bb.student_id = s.id
    ORDER BY b.id DESC
  `;

  try {
    const results = await queryDB(query);
    res.json(results);
  } catch (err) {
    handleError(res, "Database error", err);
  }
});

router.post("/books", async (req, res) => {
  const { title, author, category, isbn } = req.body;
  console.log("Adding new book:", { title, author, category, isbn });

  if (!title || !author || !category || !isbn) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingBook = await queryDB("SELECT id FROM books WHERE isbn = ?", [
      isbn,
    ]);
    if (existingBook.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    const query = `
      INSERT INTO books (title, author, isbn, category, added_date, status)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'available')
    `;

    const result = await queryDB(query, [title, author, isbn, category]);
    res.status(201).json({
      success: true,
      message: "Book added successfully",
      bookId: result.insertId,
    });
  } catch (err) {
    handleError(res, "Error adding book", err);
  }
});

router.put("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const { title, author, category, isbn, status } = req.body;

  if (!title || !author || !category || !isbn) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const book = await queryDB("SELECT id, status FROM books WHERE id = ?", [
      bookId,
    ]);
    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const borrowStatus = await queryDB(
      "SELECT status FROM book_borrowings WHERE book_id = ? AND status = 'active'",
      [bookId]
    );
    const isBorrowed = borrowStatus.length > 0;

    const updateQuery = isBorrowed
      ? "UPDATE books SET title = ?, author = ?, category = ?, isbn = ? WHERE id = ?"
      : "UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, status = ? WHERE id = ?";

    const updateParams = isBorrowed
      ? [title, author, category, isbn, bookId]
      : [
          title,
          author,
          category,
          isbn,
          status?.toLowerCase() || "available",
          bookId,
        ];

    await queryDB(updateQuery, updateParams);

    res.json({
      success: true,
      message: "Book updated successfully",
      isBorrowed,
    });
  } catch (err) {
    handleError(res, "Error updating book", err);
  }
});

router.delete("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const book = await queryDB("SELECT id FROM books WHERE id = ?", [bookId]);
    if (book.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const borrowStatus = await queryDB(
      "SELECT status FROM book_borrowings WHERE book_id = ? AND status = 'active'",
      [bookId]
    );
    if (borrowStatus.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book that is currently borrowed",
      });
    }

    await new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) reject(err);

        try {
          await queryDB("DELETE FROM book_borrowings WHERE book_id = ?", [
            bookId,
          ]);
          await queryDB("DELETE FROM books WHERE id = ?", [bookId]);

          db.commit((err) => {
            if (err) reject(err);
            resolve();
          });
        } catch (err) {
          db.rollback(() => reject(err));
        }
      });
    });

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (err) {
    handleError(res, "Error deleting book", err);
  }
});

router.get("/dashboard/stats", async (req, res) => {
  const queries = {
    totalBooks: "SELECT COUNT(*) as count FROM books",
    activeBorrowings:
      "SELECT COUNT(*) as count FROM book_borrowings WHERE status = 'active'",
    registeredStudents: "SELECT COUNT(*) as count FROM students",
    overdueBooks:
      "SELECT COUNT(*) as count FROM book_borrowings WHERE status = 'overdue'",
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
    popularCategories: `
      SELECT category, COUNT(*) as count
      FROM books
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `,
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

  try {
    const results = await Promise.allSettled(
      Object.entries(queries).map(async ([key, query]) => {
        const result = await queryDB(query);
        return { key, result };
      })
    );

    const stats = {};
    results.forEach(({ value }) => {
      if (
        ["borrowingTrends", "popularCategories", "recentActivities"].includes(
          value.key
        )
      ) {
        stats[value.key] = value.result;
      } else {
        stats[value.key] = value.result[0]?.count || 0;
      }
    });

    res.json(stats);
  } catch (err) {
    handleError(res, "Error fetching dashboard statistics", err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const admin = await queryDB(
      "SELECT id, fullname, email, role FROM admins WHERE id = ?",
      [req.params.id]
    );

    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json(admin[0]);
  } catch (err) {
    handleError(res, "Database error", err);
  }
});

function queryDB(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function handleError(res, message, error) {
  console.error(message, error);
  res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
}

module.exports = router;
