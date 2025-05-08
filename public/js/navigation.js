// Function to set active navigation link based on current page
document.addEventListener("DOMContentLoaded", function () {
  // Get current page path
  const currentPath = window.location.pathname;

  // Get all navigation links
  const navLinks = document.querySelectorAll(".primaryNavigation a");

  // Loop through each link
  navLinks.forEach((link) => {
    // If the link's href matches the current path
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }

    // Remove active class when hovering other links
    link.addEventListener("mouseleave", () => {
      if (link.getAttribute("href") !== currentPath) {
        link.classList.remove("active");
      }
    });
  });
});
