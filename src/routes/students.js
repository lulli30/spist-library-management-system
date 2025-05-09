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
    `;

    // Get books due soon (within next 7 days)
    const dueSoonQuery = `
      SELECT COUNT(*) as count
      FROM book_borrowings
      WHERE student_id = ?
      AND status = 'borrowed'
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

router.get("/books/recommended/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    console.log("Fetching recommendations for student:", studentId); // Debug log

    // First, get the user's reading preferences based on their history
    const preferencesQuery = `
      SELECT 
        b.author,
        b.category,
        COUNT(*) as borrow_count
      FROM book_borrowings bb
      JOIN books b ON bb.book_id = b.id
      WHERE bb.student_id = ?
      GROUP BY b.author, b.category
      ORDER BY borrow_count DESC
      LIMIT 3
    `;

    const preferences = await executeQuery(preferencesQuery, [studentId]);
    console.log("User preferences:", preferences); // Debug log

    if (preferences.length === 0) {
      // If no borrowing history, return popular books or random selection
      const generalRecsQuery = `
        SELECT DISTINCT
          b.id,
          b.title,
          b.author,
          b.category,
          b.status,
          CASE 
            WHEN bb.id IS NOT NULL THEN 'borrowed'
            ELSE b.status
          END as current_status,
          (
            SELECT COUNT(*)
            FROM book_borrowings
            WHERE book_id = b.id
          ) as popularity
        FROM books b
        LEFT JOIN (
          SELECT book_id, id
          FROM book_borrowings
          WHERE status = 'borrowed'
        ) bb ON b.id = bb.book_id
        WHERE b.status = 'available'
        AND b.status != 'deleted'
        ORDER BY popularity DESC, RAND()
        LIMIT 10
      `;
      console.log("Fetching general recommendations"); // Debug log
      const generalRecs = await executeQuery(generalRecsQuery);
      console.log("General recommendations found:", generalRecs.length); // Debug log
      return res.json(generalRecs);
    }

    // Build conditions for recommendations based on preferences
    const conditions = preferences
      .map(
        (pref) =>
          `(b.author = ${db.escape(pref.author)} OR b.category = ${db.escape(
            pref.category
          )})`
      )
      .join(" OR ");

    // Get recommended books based on user preferences
    const recommendationsQuery = `
      SELECT DISTINCT
        b.id,
        b.title,
        b.author,
        b.category,
        b.status,
        CASE 
          WHEN bb.id IS NOT NULL THEN 'borrowed'
          ELSE b.status
        END as current_status,
        CASE
          WHEN b.author IN (${preferences
            .map((p) => db.escape(p.author))
            .join(",")}) THEN 2
          WHEN b.category IN (${preferences
            .map((p) => db.escape(p.category))
            .join(",")}) THEN 1
          ELSE 0
        END as relevance_score
      FROM books b
      LEFT JOIN (
        SELECT book_id, id
        FROM book_borrowings
        WHERE status = 'borrowed'
      ) bb ON b.id = bb.book_id
      LEFT JOIN (
        SELECT book_id
        FROM book_borrowings
        WHERE student_id = ?
      ) user_borrows ON b.id = user_borrows.book_id
      WHERE b.status != 'deleted'
        AND (${conditions})
        AND (user_borrows.book_id IS NULL OR b.status = 'available')
      ORDER BY relevance_score DESC, RAND()
      LIMIT 10
    `;

    console.log("Fetching personalized recommendations"); // Debug log
    const recommendations = await executeQuery(recommendationsQuery, [
      studentId,
    ]);
    console.log("Personalized recommendations found:", recommendations.length); // Debug log

    // If we didn't get enough recommendations, add some general ones
    if (recommendations.length < 10) {
      const remainingCount = 10 - recommendations.length;
      const additionalRecsQuery = `
        SELECT DISTINCT
          b.id,
          b.title,
          b.author,
          b.category,
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
        ) bb ON b.id = bb.book_id
        WHERE b.status = 'available'
        AND b.status != 'deleted'
        AND b.id NOT IN (${recommendations
          .map((r) => db.escape(r.id))
          .join(",")})
        ORDER BY RAND()
        LIMIT ?
      `;

      const additionalRecs = await executeQuery(additionalRecsQuery, [
        remainingCount,
      ]);
      recommendations.push(...additionalRecs);
    }

    res.json(recommendations);
  } catch (err) {
    console.error("Error fetching recommended books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/borrow-book", async (req, res) => {
  try {
    const { studentId, bookId, returnDate } = req.body;

    // Validate return date
    if (!returnDate) {
      return res.status(400).json({
        success: false,
        message: "Return date is required",
      });
    }

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
              return_date,
              status
            ) VALUES (
              ?, 
              ?, 
              CURRENT_TIMESTAMP, 
              ?,
              ?,
              'borrowed'
            )
          `;
          await executeQuery(borrowQuery, [
            bookId,
            studentId,
            returnDate,
            returnDate,
          ]);

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
