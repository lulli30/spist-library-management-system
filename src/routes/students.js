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

// Get student dashboard statistics
router.get("/:studentId/dashboard-stats", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get total available books
    const availableBooksQuery = `
      SELECT COUNT(*) as count 
      FROM books 
      WHERE status = 'available'
    `;

    // Get books borrowed by student
    const borrowedBooksQuery = `
      SELECT COUNT(*) as count
      FROM book_borrowings
      WHERE student_id = ?
      AND status IN ('borrowed', 'overdue')
      AND return_date IS NULL
    `;

    // Get books due soon (within next 7 days)
    const dueSoonQuery = `
      SELECT COUNT(*) as count
      FROM book_borrowings
      WHERE student_id = ?
      AND status = 'borrowed'
      AND return_date IS NULL
      AND due_date <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
      AND due_date > CURRENT_DATE
    `;

    const [availableBooks, borrowedBooks, dueSoon] = await Promise.all([
      executeQuery(availableBooksQuery),
      executeQuery(borrowedBooksQuery, [studentId]),
      executeQuery(dueSoonQuery, [studentId]),
    ]);

    res.json({
      availableBooks: availableBooks[0].count,
      borrowedBooks: borrowedBooks[0].count,
      dueSoon: dueSoon[0].count,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

router.get("/books/recent", async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.category,
        b.added_date,
        b.status,
        CASE 
          WHEN bb.id IS NOT NULL THEN 'borrowed'
          ELSE b.status
        END as current_status
      FROM books b
      LEFT JOIN (
        SELECT book_id, id
        FROM book_borrowings
        WHERE status = 'borrowed'
        AND return_date IS NULL
      ) bb ON b.id = bb.book_id
      WHERE b.status != 'deleted'
      ORDER BY b.added_date DESC
      LIMIT 10
    `;

    const books = await executeQuery(query);
    res.json(books);
  } catch (err) {
    console.error("Error fetching recent books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/borrow-book", async (req, res) => {
  try {
    const { studentId, bookId } = req.body;

    const bookQuery = `
      SELECT status 
      FROM books 
      WHERE id = ? AND status = 'available'
    `;
    const bookResult = await executeQuery(bookQuery, [bookId]);

    if (bookResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      });
    }

    const overdueQuery = `
      SELECT COUNT(*) as overdue_count
      FROM book_borrowings
      WHERE student_id = ?
      AND status = 'overdue'
      AND return_date IS NULL
    `;
    const overdueResult = await executeQuery(overdueQuery, [studentId]);

    if (overdueResult[0].overdue_count > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot borrow new books while having overdue books",
      });
    }

    await new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) reject(err);

        try {
          const borrowQuery = `
            INSERT INTO book_borrowings (
              book_id, 
              student_id, 
              borrow_date, 
              due_date, 
              status
            ) VALUES (
              ?, 
              ?, 
              CURRENT_TIMESTAMP, 
              DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY), 
              'borrowed'
            )
          `;
          await executeQuery(borrowQuery, [bookId, studentId]);

          const updateBookQuery = `
            UPDATE books 
            SET status = 'borrowed' 
            WHERE id = ?
          `;
          await executeQuery(updateBookQuery, [bookId]);

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
      message: "Book borrowed successfully",
    });
  } catch (err) {
    console.error("Error borrowing book:", err);
    res.status(500).json({
      success: false,
      message: "Error borrowing book",
    });
  }
});

module.exports = router;
