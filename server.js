const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/pages", express.static(path.join(__dirname, "src/pages")));

app.use("/auth", authRoutes);
app.use("/api", adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "src/pages/signup.html"));
});

app.get("/login-verification", (req, res) => {
  res.sendFile(path.resolve(__dirname, "src/pages/login-verification.html"));
});

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

app.get("*", (req, res) => {
  const requestedPage = req.path.substring(1);
  const pagesPath = path.join(__dirname, "src/pages", requestedPage);

  try {
    if (require("fs").existsSync(pagesPath)) {
      return res.sendFile(pagesPath);
    }

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
