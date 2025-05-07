function login() {
  const body = document.body;
  body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "/login";
  }, 500); // Match this duration with the CSS transition duration
}

function signup() {
  const body = document.body;
  body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "/signup";
  }, 500); // Match this duration with the CSS transition duration
}

// Add event listeners to the navigation links
document.querySelectorAll(".primaryNavigation a").forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const body = document.body;
    body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = this.getAttribute("href");
    }, 500); // Match this duration with the CSS transition duration
  });
});

// Predefined admin and student credentials
const adminCredentials = {
  email: "admin@spist.edu",
  password: "admin123",
};

const studentCredentials = {
  email: "student@spist.edu",
  password: "student123",
};

// login steps
function handleSubmit(event) {
  event.preventDefault();

  // Get input values
  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("password").value;

  // Check if credentials match admin credentials
  if (
    emailInput === adminCredentials.email &&
    passwordInput === adminCredentials.password
  ) {
    // Admin login successful
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", "admin");

    // Fade out the form
    const form = event.target;
    form.classList.add("fade-out");

    // Redirect to admin dashboard
    setTimeout(() => {
      window.location.href = "/admin-dashboard";
    }, 500);
  }
  // Check if credentials match student credentials
  else if (
    emailInput === studentCredentials.email &&
    passwordInput === studentCredentials.password
  ) {
    // Student login successful
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", "student");

    // Fade out the form
    const form = event.target;
    form.classList.add("fade-out");

    // Redirect to student dashboard
    setTimeout(() => {
      window.location.href = "/student-dashboard";
    }, 500);
  } else {
    // Invalid credentials
    alert(
      "Invalid email or password. Please try again with valid credentials."
    );
  }
}

function redirectToSignup(event) {
  event.preventDefault();
  const signupLink = event.target;
  signupLink.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "/signup";
  }, 500);
}

function redirectToLogin(event) {
  if (event) event.preventDefault();
  window.location.href = "/login";
}

// Function to toggle password visibility
function setupPasswordToggle() {
  const showPassword = document.getElementById("showPassword");
  if (showPassword) {
    showPassword.addEventListener("change", function () {
      const passwordField = document.getElementById("password");
      if (passwordField) {
        if (this.checked) {
          passwordField.type = "text";
        } else {
          passwordField.type = "password";
        }
      }
    });
  }
}

// Call the function when the DOM is loaded
document.addEventListener("DOMContentLoaded", setupPasswordToggle);

function logout() {
  // Clear user data from session storage
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userName");

  // Redirect to login page
  window.location.href = "/login";
}
