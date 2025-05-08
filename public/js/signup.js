document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const showPasswordCheckbox = document.getElementById("showPassword");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Show/hide password functionality
  if (showPasswordCheckbox && passwordInput) {
    showPasswordCheckbox.addEventListener("change", () => {
      passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
      if (confirmPasswordInput) {
        confirmPasswordInput.type = showPasswordCheckbox.checked
          ? "text"
          : "password";
      }
    });
  }

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Account created successfully! Please login.");
        // Fade out and redirect to login page
        form.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } else {
        alert(data.message || "Error creating account. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during signup. Please try again.");
    }
  });
});
