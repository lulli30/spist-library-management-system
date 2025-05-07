document.getElementById("showPassword").addEventListener("change", function () {
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("Cpassword");

  const type = this.checked ? "text" : "password";

  if (passwordField) passwordField.type = type;
  if (confirmPasswordField) confirmPasswordField.type = type;
});

document
  .getElementById("showPasswordEdit")
  .addEventListener("change", function () {
    const passwordField = document.getElementById("passwordEdit");
    const confirmPasswordField = document.getElementById("CpasswordEdit");

    const type = this.checked ? "text" : "password";

    if (passwordField) passwordField.type = type;
    if (confirmPasswordField) confirmPasswordField.type = type;
  });

function showModal() {
  document.getElementById("adminModal").style.display = "flex";
}

function showModalEdit() {
  document.getElementById("adminEdit").style.display = "flex";
}

function modalDelete() {
  document.getElementById("modalDelete").style.display = "flex";
}

function closeModal() {
  document.getElementById("adminModal").style.display = "none";
  document.getElementById("adminEdit").style.display = "none";
  document.getElementById("modalDelete").style.display = "none";
}

function showLogoutModal() {
  document.getElementById("logoutModal").style.display = "flex";
}

function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}

function logout() {
  // Clear session storage (user data)
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userName");

  // Redirect to login page with correct path
  window.location.href = "/login";
}
