function closeModal() {
  document.getElementById("bookModal").style.display = "none";
  document.getElementById("bookedit").style.display = "none";
  document.getElementById("modalDelete").style.display = "none";
}
function confirmDelete() {
  document.getElementById("modalDelete").style.display = "flex";
}
function showBookModal() {
  document.getElementById("bookModal").style.display = "flex";
}
function showBookedit() {
  document.getElementById("bookedit").style.display = "flex";
}

// Function to handle the "Done" button click
function handleDone() {
  // Get the values from the input fields
  const bookTitle = document.getElementById("booktitle").value;
  const bookId = document.getElementById("bookid").value;
  const bookGenre = document.getElementById("bookgenre").value;
  const bookStatus = document.getElementById("bookstatus").value;
  const rentedBy = document.getElementById("rentedby").value;

  // Perform the action you want, e.g., submit the form or add the book to a list
  console.log("Book Title:", bookTitle);
  console.log("Book ID:", bookId);
  console.log("Book Genre:", bookGenre);
  console.log("Book Status:", bookStatus);
  console.log("Rented By:", rentedBy);

  // Close the modal
  closeModal();
}

// Function to handle the "Delete" button click
function handleDelete() {
  // Perform the delete action, e.g., remove the book from a list
  console.log("Delete button clicked");

  // Close the modal
  closeModal();
}

// Attach event listeners to the "Done" and "Delete" buttons
document.addEventListener("DOMContentLoaded", (event) => {
  document
    .querySelector("#bookModal .submit-btn")
    .addEventListener("click", handleDone);
  document
    .querySelector("#bookModal .delete-btn")
    .addEventListener("click", handleDelete);
});

// Authentication check - redirect if not logged in
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userRole = sessionStorage.getItem("userRole");

  if (!isLoggedIn || !userRole) {
    alert("Please log in to access this page.");
    window.location.href = "/login";
  }
});
