# SPIST Library Management System

A comprehensive web-based library management system developed for Southern Philippines Institute of Science & Technology (SPIST). This modern application streamlines library operations by providing an intuitive interface for managing books, user accounts, and administrative functions. The system supports both administrators and students with role-specific features designed to enhance the library experience.

## Features

### Admin Features

- Interactive dashboard with real-time statistics
- Comprehensive book management (add, edit, delete, track)
- User management system with role-based access control
- Admin account management with secure permissions
- Generate reports and analytics
- Track book borrowing history

### Student Features

- Personalized dashboard with book recommendations
- Advanced book search and filtering
- Digital book borrowing management
- Profile customization
- Borrowing history tracking
- Due date notifications

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Bootstrap 5
- **Additional Tools**: XAMPP (MySQL Server)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- XAMPP (for MySQL Server)

## Project Structure

```
├── public/                  # Static assets and client-side files
│   ├── css/                 # CSS stylesheets
│   │   ├── admin.css        # Admin dashboard styles
│   │   ├── common.css       # Shared styles
│   │   ├── login.css        # Login page styles
│   │   ├── student.css      # Student dashboard styles
│   │   └── ...
│   ├── dashboard/           # Dashboard pages
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── admin-dashboard.html
│   │   │   ├── admin-books.html
│   │   │   ├── admin-users.html
│   │   │   └── admin-admins.html
│   │   └── student/         # Student dashboard pages
│   │       ├── student-dashboard.html
│   │       ├── student-books.html
│   │       ├── student-borrowed.html
│   │       └── student-profile.html
│   ├── img/                 # Image assets
│   └── js/                  # JavaScript files
│       ├── admin.js         # Admin functionality
│       ├── login.js         # Authentication logic
│       ├── user.js          # User functionality
│       └── ...
├── src/                     # Source code
│   ├── pages/               # Main pages
│   │   ├── home.html        # Homepage
│   │   ├── login.html       # Login page
│   │   ├── signup.html      # Registration page
│   │   └── ...
│   └── components/          # Reusable components
├── server.js                # Node.js server setup
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

## Database Setup

1. Start XAMPP:

   - Open XAMPP Control Panel
   - Start MySQL service
   - Ensure MySQL shows green status

2. Import Database:
   - Open your web browser and navigate to: `http://localhost/phpmyadmin`
   - Click on "New" to create a new database
   - Name the database `spist_library`
   - Click on the newly created database
   - Go to "Import" tab
   - Click "Choose File" and select `spist_library.sql` from the project root
   - Click "Go" to import the database structure and data

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/spist-library.git
   cd spist-library
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MySQL service:

   - Open XAMPP Control Panel
   - Start MySQL service
   - Verify MySQL is running (green status)

4. Start the development server:

   ```bash
   npm run dev
   ```

5. For production deployment:

   ```bash
   npm run build
   npm start
   ```

6. Access the application:
   ```
   http://localhost:3000
   ```

## Routes

### Public Routes

- `/` - Homepage
- `/login` - Login page
- `/signup` - New user registration

### Admin Routes

- `/admin` - Admin dashboard (redirects to admin-dashboard.html)
- `/admin-dashboard` - Admin dashboard
- `/admin-books` - Book management for admins
- `/admin-users` - User management for admins
- `/admin-admins` - Admin management

### Student Routes

- `/student` - Student dashboard (redirects to student-dashboard.html)
- `/student-dashboard` - Student main dashboard
- `/student-books` - Browse books page for students
- `/student-borrowed` - Manage borrowed books for students
- `/student-profile` - Student profile management

## Styling

The application uses a modular CSS structure:

- `common.css` - Base styles and shared components
- `admin.css` - Admin dashboard and components
- `student.css` - Student dashboard and components
- `login.css` - Authentication pages
