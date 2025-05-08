-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS spist_library;
USE spist_library;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS book_borrowings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,  -- Format: STD-YYYY-XXX
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    year_level VARCHAR(20),
    student_type VARCHAR(50),
    contact_number VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    category VARCHAR(100),
    status ENUM('available', 'borrowed') DEFAULT 'available',
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book_borrowings table
CREATE TABLE IF NOT EXISTS book_borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
    return_date TIMESTAMP NULL,
    status ENUM('active', 'overdue', 'returned') DEFAULT 'active',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'system_admin') DEFAULT 'system_admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample students
INSERT INTO students (student_id, fullname, email, password, department, year_level, student_type, contact_number) VALUES
('STD-2023-001', 'Maria Garcia', 'maria@spist.edu', 'password123', 'Computer Science', 'Second Year', 'Undergraduate', '123-456-7890'),
('STD-2023-002', 'John Smith', 'john@spist.edu', 'password123', 'Engineering', 'Third Year', 'Undergraduate', '123-456-7891'),
('STD-2023-003', 'Sarah Wilson', 'sarah@spist.edu', 'password123', 'Computer Science', 'First Year', 'Undergraduate', '123-456-7892');

-- Insert sample books
INSERT INTO books (title, author, isbn, category) VALUES
('Introduction to Programming', 'John Smith', '978-1-2345-6789-0', 'Computer Science'),
('Data Structures and Algorithms', 'Jane Doe', '978-1-2345-6789-1', 'Computer Science'),
('Advanced Mathematics', 'Robert Johnson', '978-1-2345-6789-2', 'Mathematics'),
('Web Development Fundamentals', 'Sarah Wilson', '978-1-2345-6789-3', 'Computer Science'),
('Introduction to Physics', 'David Lee', '978-1-2345-6789-4', 'Physics'),
('Organic Chemistry', 'Emily Chen', '978-1-2345-6789-5', 'Chemistry'),
('World History', 'Michael Brown', '978-1-2345-6789-6', 'History'),
('Introduction to Biology', 'Lisa Taylor', '978-1-2345-6789-7', 'Biology'),
('Classic Literature', 'James Wilson', '978-1-2345-6789-8', 'Literature'),
('Database Management', 'Karen Martin', '978-1-2345-6789-9', 'Computer Science');

-- Insert default admin
INSERT INTO admins (fullname, email, password, role) VALUES
('Admin', 'admin@spist.edu', 'admin123', 'super_admin'),
('Sarah Wilson', 'sarah.admin@spist.edu', 'admin456', 'system_admin');

-- Insert sample borrowing records (using explicit due_date values)
INSERT INTO book_borrowings (book_id, student_id, due_date, status) VALUES
-- Active borrows for Maria Garcia
(1, 1, CURRENT_TIMESTAMP + INTERVAL 30 DAY, 'active'),
(2, 1, CURRENT_TIMESTAMP + INTERVAL 30 DAY, 'active'),

-- Returned books for Maria Garcia (with past due dates)
(3, 1, CURRENT_TIMESTAMP - INTERVAL 10 DAY, 'returned'),
(4, 1, CURRENT_TIMESTAMP - INTERVAL 20 DAY, 'returned');

-- Update books status for borrowed books
UPDATE books SET status = 'borrowed' WHERE id IN (1, 2);

-- Update return_date for returned books
UPDATE book_borrowings 
SET return_date = CURRENT_TIMESTAMP - INTERVAL 2 DAY
WHERE status = 'returned';

-- Example: Query to show currently borrowed books (as in your dashboard)
SELECT 
    b.title as "Book Title",
    b.author as "Author",
    bb.borrow_date as "Borrowed Date",
    bb.due_date as "Due Date",
    bb.status as "Status"
FROM book_borrowings bb
JOIN books b ON bb.book_id = b.id
WHERE bb.student_id = 1 
AND bb.status != 'returned';

-- Example: Query for borrowing history
SELECT 
    b.title as "Book Title",
    b.author as "Author",
    bb.borrow_date as "Borrowed Date",
    bb.return_date as "Returned Date",
    DATEDIFF(bb.return_date, bb.borrow_date) as "Duration"
FROM book_borrowings bb
JOIN books b ON bb.book_id = b.id
WHERE bb.student_id = 1 
AND bb.status = 'returned';