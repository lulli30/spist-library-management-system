# SPIST Library Management System

A web-based library management system for Southern Philippines Institute of Science & Technology (SPIST). This system helps manage books, users, and administrative functions for the school library.

## Project Structure

The project is organized as follows:

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

## Routes

The application has the following main routes:

- `/` - Homepage
- `/login` - Login page
- `/signup` - New user registration
- `/admin` - Admin dashboard (redirects to admin-dashboard.html)
- `/admin-dashboard` - Admin dashboard
- `/admin-books` - Book management for admins
- `/admin-users` - User management for admins
- `/admin-admins` - Admin management
- `/student` - Student dashboard (redirects to student-dashboard.html)
- `/student-dashboard` - Student main dashboard
- `/student-books` - Browse books page for students
- `/student-borrowed` - Manage borrowed books for students
- `/student-profile` - Student profile management

## Features

### Admin Features

- Dashboard with statistics
- Manage books (add, edit, delete)
- Manage users (view, edit, delete)
- Manage other admins

### Student Features

- Dashboard with statistics and featured books
- Browse available books
- View and manage borrowed books
- Update profile information

## Styling

The CSS structure has been organized as follows:

- `common.css` - Base styles shared across the application
- `admin.css` - Specific styles for admin dashboard and components
- `student.css` - Specific styles for student dashboard and components
- `login.css` - Styles for login, signup, and authentication pages

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Start the server:

   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Default Login Credentials

- Admin: admin@spist.edu / admin123
- Student: student@spist.edu / student123
