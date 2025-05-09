const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET /api/books - Get all books with optional search and category filters
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = "SELECT * FROM books WHERE 1=1";
    const params = [];

    // Add search filter if provided
    if (search) {
      query += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Add category filter if provided
    if (category && category !== "") {
      query += " AND category = ?";
      params.push(category);
    }

    // Add order by
    query += " ORDER BY title ASC";

    // Execute query using the queryDB helper function
    const books = await queryDB(query, params);
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// GET /api/books/categories - Get all unique categories
router.get("/categories", async (req, res) => {
  try {
    const query =
      "SELECT DISTINCT category FROM books WHERE status != 'deleted' ORDER BY category ASC";
    const categories = await queryDB(query);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
});

// Helper function for database queries
const queryDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// POST /api/books/borrow - Borrow a book
router.post("/borrow", async (req, res) => {
  const { bookId, studentId, borrowDate, returnDate, notes } = req.body;

  try {
    // Check if book is available
    const books = await queryDB("SELECT status FROM books WHERE id = ?", [
      bookId,
    ]);
    if (!books.length || books[0].status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Book is not available for borrowing",
      });
    }

    // Create borrowing record
    await queryDB(
      "INSERT INTO book_borrowings (book_id, student_id, borrow_date, expected_return_date, notes) VALUES (?, ?, ?, ?, ?)",
      [bookId, studentId, borrowDate, returnDate, notes]
    );

    // Update book status
    await queryDB("UPDATE books SET status = ? WHERE id = ?", [
      "borrowed",
      bookId,
    ]);

    res.json({ success: true, message: "Book borrowed successfully" });
  } catch (error) {
    console.error("Error borrowing book:", error);
    res.status(500).json({
      success: false,
      message: "Error borrowing book",
      error: error.message,
    });
  }
});

module.exports = router;
