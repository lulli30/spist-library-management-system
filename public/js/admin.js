document.addEventListener("DOMContentLoaded", initializePasswordToggles);

function initializePasswordToggles() {
  setupPasswordToggle("showPassword", ["password", "Cpassword"]);
  setupPasswordToggle("showPasswordEdit", ["passwordEdit", "CpasswordEdit"]);
}

function setupPasswordToggle(toggleId, fieldIds) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    const type = toggle.checked ? "text" : "password";
    fieldIds.forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.type = type;
    });
  });
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

const showAdminModal = () => showModal("adminModal");
const showAdminEditModal = () => showModal("adminEdit");
const showDeleteModal = () => showModal("modalDelete");
const showLogoutModal = () => showModal("logoutModal");

function closeModal() {
  ["adminModal", "adminEdit", "modalDelete"].forEach((id) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "none";
  });
}

function closeLogoutModal() {
  const modal = document.getElementById("logoutModal");
  if (modal) modal.style.display = "none";
}

function logout() {
  const sessionKeys = ["isLoggedIn", "userRole", "userName", "adminId"];
  sessionKeys.forEach((key) => sessionStorage.removeItem(key));

  window.location.href = "/login";
}
