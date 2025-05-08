-- Sample Students Data
INSERT INTO students (student_id, fullname, email, password, department, year_level, student_type, contact_number) VALUES
('STD-2023-001', 'Maria Garcia', 'maria@spist.edu', 'password123', 'Computer Science', 'Second Year', 'Undergraduate', '123-456-7890'),
('STD-2023-002', 'John Smith', 'john@spist.edu', 'password123', 'Engineering', 'Third Year', 'Undergraduate', '123-456-7891'),
('STD-2023-003', 'Sarah Wilson', 'sarah@spist.edu', 'password123', 'Computer Science', 'First Year', 'Undergraduate', '123-456-7892'),
('STD-2023-004', 'Michael Brown', 'michael@spist.edu', 'password123', 'Mathematics', 'Fourth Year', 'Undergraduate', '123-456-7893'),
('STD-2023-005', 'Emily Davis', 'emily@spist.edu', 'password123', 'Physics', 'Second Year', 'Undergraduate', '123-456-7894'),
('STD-2023-006', 'David Lee', 'david@spist.edu', 'password123', 'Chemistry', 'Third Year', 'Undergraduate', '123-456-7895'),
('STD-2023-007', 'Lisa Taylor', 'lisa@spist.edu', 'password123', 'Biology', 'First Year', 'Undergraduate', '123-456-7896'),
('STD-2023-008', 'James Wilson', 'james@spist.edu', 'password123', 'Engineering', 'Fourth Year', 'Undergraduate', '123-456-7897'),
('STD-2023-009', 'Anna Martinez', 'anna@spist.edu', 'password123', 'Computer Science', 'Second Year', 'Undergraduate', '123-456-7898'),
('STD-2023-010', 'Robert Johnson', 'robert@spist.edu', 'password123', 'Mathematics', 'Third Year', 'Undergraduate', '123-456-7899');

-- Sample Books Data
INSERT INTO books (title, author, isbn, category, status) VALUES
('Introduction to Programming', 'John Smith', '978-1-2345-6789-0', 'Computer Science', 'available'),
('Data Structures and Algorithms', 'Jane Doe', '978-1-2345-6789-1', 'Computer Science', 'borrowed'),
('Advanced Mathematics', 'Robert Johnson', '978-1-2345-6789-2', 'Mathematics', 'available'),
('Web Development Fundamentals', 'Sarah Wilson', '978-1-2345-6789-3', 'Computer Science', 'borrowed'),
('Introduction to Physics', 'David Lee', '978-1-2345-6789-4', 'Physics', 'available'),
('Organic Chemistry', 'Emily Chen', '978-1-2345-6789-5', 'Chemistry', 'available'),
('World History', 'Michael Brown', '978-1-2345-6789-6', 'History', 'borrowed'),
('Introduction to Biology', 'Lisa Taylor', '978-1-2345-6789-7', 'Biology', 'available'),
('Classic Literature', 'James Wilson', '978-1-2345-6789-8', 'Literature', 'available'),
('Database Management', 'Karen Martin', '978-1-2345-6789-9', 'Computer Science', 'borrowed'),
('Calculus I', 'Peter Wang', '978-1-2345-6790-0', 'Mathematics', 'available'),
('Digital Electronics', 'Tom Anderson', '978-1-2345-6790-1', 'Engineering', 'available'),
('Machine Learning Basics', 'Alice Johnson', '978-1-2345-6790-2', 'Computer Science', 'borrowed'),
('Environmental Science', 'Rachel Green', '978-1-2345-6790-3', 'Science', 'available'),
('Software Engineering', 'Mark Davis', '978-1-2345-6790-4', 'Computer Science', 'available');

-- Sample Admins Data
INSERT INTO admins (fullname, email, password, role) VALUES
('Admin User', 'admin@spist.edu', 'admin123', 'super_admin'),
('Sarah Wilson', 'sarah.admin@spist.edu', 'admin456', 'system_admin'),
('John Librarian', 'john.lib@spist.edu', 'admin789', 'system_admin'),
('Mary Manager', 'mary.mgr@spist.edu', 'admin101', 'system_admin');

-- Sample Book Borrowings Data
INSERT INTO book_borrowings (book_id, student_id, borrow_date, due_date, return_date, status) VALUES
-- Active borrowings
(2, 1, CURRENT_TIMESTAMP - INTERVAL 5 DAY, CURRENT_TIMESTAMP + INTERVAL 25 DAY, NULL, 'active'),
(4, 2, CURRENT_TIMESTAMP - INTERVAL 3 DAY, CURRENT_TIMESTAMP + INTERVAL 27 DAY, NULL, 'active'),
(7, 3, CURRENT_TIMESTAMP - INTERVAL 10 DAY, CURRENT_TIMESTAMP + INTERVAL 20 DAY, NULL, 'active'),
(10, 4, CURRENT_TIMESTAMP - INTERVAL 2 DAY, CURRENT_TIMESTAMP + INTERVAL 28 DAY, NULL, 'active'),
(13, 5, CURRENT_TIMESTAMP - INTERVAL 7 DAY, CURRENT_TIMESTAMP + INTERVAL 23 DAY, NULL, 'active'),

-- Overdue books
(1, 6, CURRENT_TIMESTAMP - INTERVAL 35 DAY, CURRENT_TIMESTAMP - INTERVAL 5 DAY, NULL, 'overdue'),
(3, 7, CURRENT_TIMESTAMP - INTERVAL 40 DAY, CURRENT_TIMESTAMP - INTERVAL 10 DAY, NULL, 'overdue'),

-- Returned books
(5, 1, CURRENT_TIMESTAMP - INTERVAL 60 DAY, CURRENT_TIMESTAMP - INTERVAL 30 DAY, CURRENT_TIMESTAMP - INTERVAL 28 DAY, 'returned'),
(8, 2, CURRENT_TIMESTAMP - INTERVAL 55 DAY, CURRENT_TIMESTAMP - INTERVAL 25 DAY, CURRENT_TIMESTAMP - INTERVAL 26 DAY, 'returned'),
(11, 3, CURRENT_TIMESTAMP - INTERVAL 45 DAY, CURRENT_TIMESTAMP - INTERVAL 15 DAY, CURRENT_TIMESTAMP - INTERVAL 16 DAY, 'returned'),
(14, 4, CURRENT_TIMESTAMP - INTERVAL 50 DAY, CURRENT_TIMESTAMP - INTERVAL 20 DAY, CURRENT_TIMESTAMP - INTERVAL 19 DAY, 'returned'),
(6, 5, CURRENT_TIMESTAMP - INTERVAL 30 DAY, CURRENT_TIMESTAMP - INTERVAL 0 DAY, CURRENT_TIMESTAMP - INTERVAL 2 DAY, 'returned');

-- Update books status based on borrowings
UPDATE books SET status = 'borrowed' WHERE id IN (2, 4, 7, 10, 13, 1, 3); 