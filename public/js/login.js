function login() {
  const body = document.body;
  body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "/login";
  }, 500);
}

function signup() {
  const body = document.body;
  body.classList.add("fade-out");

  setTimeout(() => {
    window.location.href = "/signup";
  }, 500);
}

document.querySelectorAll(".primaryNavigation a").forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const body = document.body;
    body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = this.getAttribute("href");
    }, 500);
  });
});

async function handleSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email").value;
  const passwordInput = document.getElementById("password").value;

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput,
        password: passwordInput,
      }),
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userRole", data.userRole);
      if (data.studentId) {
        sessionStorage.setItem("studentId", data.studentId);
      }
      if (data.adminId) {
        sessionStorage.setItem("adminId", data.adminId);
        sessionStorage.setItem("adminRole", data.role);
      }

      const form = event.target;
      form.classList.add("fade-out");

      setTimeout(() => {
        window.location.href =
          data.userRole === "admin" ? "/admin-dashboard" : "/student-dashboard";
      }, 500);
    } else {
      alert("Invalid email or password. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred during login. Please try again.");
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

document.addEventListener("DOMContentLoaded", () => {
  const showPasswordCheckbox = document.getElementById("showPassword");
  const passwordInput = document.getElementById("password");

  if (showPasswordCheckbox && passwordInput) {
    showPasswordCheckbox.addEventListener("change", () => {
      passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
    });
  }
});

function logout() {
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userName");

  window.location.href = "/login";
}
