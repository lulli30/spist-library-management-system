const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// Serve HTML pages from src/pages
app.use("/pages", express.static(path.join(__dirname, "src/pages")));

// Main route - serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src/pages/home.html"));
});

// Authentication routes
app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src/pages/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src/pages/signup.html"));
});

app.get("/login-verification", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src/pages/login-verification.html"));
});

// Admin dashboard routes
app.get("/admin", (req, res) => {
  res.redirect("/dashboard/admin/admin-dashboard.html");
});

app.get("/admin-dashboard", (req, res) => {
  res.redirect("/dashboard/admin/admin-dashboard.html");
});

app.get("/admin-books", (req, res) => {
  res.redirect("/dashboard/admin/admin-books.html");
});

app.get("/admin-users", (req, res) => {
  res.redirect("/dashboard/admin/admin-users.html");
});

app.get("/admin-admins", (req, res) => {
  res.redirect("/dashboard/admin/admin-admins.html");
});

// Student dashboard routes
app.get("/student", (req, res) => {
  res.redirect("/dashboard/student/student-dashboard.html");
});

app.get("/student-dashboard", (req, res) => {
  res.redirect("/dashboard/student/student-dashboard.html");
});

app.get("/student-books", (req, res) => {
  res.redirect("/dashboard/student/student-books.html");
});

app.get("/student-borrowed", (req, res) => {
  res.redirect("/dashboard/student/student-borrowed.html");
});

app.get("/student-profile", (req, res) => {
  res.redirect("/dashboard/student/student-profile.html");
});

// For any other route, try to serve the file if it exists
app.get("*", (req, res) => {
  // First try to find the file in src/pages
  const requestedPage = req.path.substring(1); // Remove leading slash
  const pagesPath = path.join(__dirname, "src/pages", requestedPage);

  try {
    if (require("fs").existsSync(pagesPath)) {
      return res.sendFile(pagesPath);
    }

    // If not found in src/pages, try in public directory
    // The static middleware should handle this, but if it fails, fallback to home
    res.sendFile(path.resolve(__dirname, "src/pages/home.html"));
  } catch (err) {
    console.error(err);
    res.sendFile(path.resolve(__dirname, "src/pages/home.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
