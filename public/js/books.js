let currentBookIdForDeletion = null;

function closeModal() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => (modal.style.display = "none"));
  document.body.classList.remove("modal-open");
  currentBookIdForDeletion = null;
}

function showModal() {
  document.getElementById("adminModal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const userRole = sessionStorage.getItem("userRole");

  if (!isLoggedIn || !userRole) {
    alert("Please log in to access this page.");
    window.location.href = "/login";
    return;
  }

  const addBookForm = document.getElementById("addBookForm");
  const editBookForm = document.getElementById("editBookForm");
  const deleteConfirmBtn = document.querySelector(".delete-confirm-btn");

  if (addBookForm) {
    addBookForm.addEventListener("submit", handleAddBook);
  }

  if (editBookForm) {
    editBookForm.addEventListener("submit", handleEditBook);
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", handleDeleteBook);
  }

  await loadBooks();
});

async function loadBooks() {
  try {
    const response = await fetch("/api/admin/books");
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch books");
    }
    const books = await response.json();
    displayBooks(books);
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load books. Please try again later.");
  }
}

function displayBooks(books) {
  const tbody = document.querySelector(".user-table tbody");
  tbody.innerHTML = "";

  books.forEach((book) => {
    const row = createBookRow(book);
    tbody.appendChild(row);
  });
}

function createBookRow(book) {
  const row = document.createElement("tr");
  const statusClass =
    book.current_status.toLowerCase() === "borrowed"
      ? "status-borrowed"
      : "status-available";

  let statusInfo = book.current_status;
  if (book.current_status === "Borrowed") {
    statusInfo += `<br><small>By: ${book.borrowed_by}<br>Due: ${formatDate(
      book.due_date
    )}</small>`;
  }

  row.innerHTML = `
    <td>${book.id}</td>
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.category}</td>
    <td>${book.isbn}</td>
    <td>${formatDate(book.added_date)}</td>
    <td class="${statusClass}">${statusInfo}</td>
    <td>
      <button class="btn edit-btn" data-book='${JSON.stringify(
        book
      )}'>Edit</button>
      <button class="btn delete-btn" data-book-id="${book.id}" ${
    book.current_status === "Borrowed" ? "disabled" : ""
  }>Delete</button>
    </td>
  `;

  attachRowEventListeners(row);

  return row;
}

function attachRowEventListeners(row) {
  const editBtn = row.querySelector(".edit-btn");
  const deleteBtn = row.querySelector(".delete-btn");

  editBtn.addEventListener("click", function () {
    const bookData = JSON.parse(this.dataset.book);
    handleEditClick(bookData);
  });

  deleteBtn.addEventListener("click", function () {
    const bookId = this.dataset.bookId;
    showDeleteModal(bookId);
  });
}

function handleEditClick(book) {
  if (!book?.id) {
    console.error("Invalid book data:", book);
    alert("Error loading book data. Please try again.");
    return;
  }

  const formElements = {
    title: document.getElementById("titleEdit"),
    author: document.getElementById("authorEdit"),
    category: document.getElementById("categoryEdit"),
    isbn: document.getElementById("isbnEdit"),
    status: document.getElementById("statusEdit"),
  };

  if (!Object.values(formElements).every((element) => element)) {
    console.error("Required form elements not found");
    alert("Error loading edit form. Please try again.");
    return;
  }

  formElements.title.value = book.title || "";
  formElements.author.value = book.author || "";
  formElements.category.value = book.category || "";
  formElements.isbn.value = book.isbn || "";

  const isBorrowed = book.current_status?.toLowerCase() === "borrowed";
  formElements.status.disabled = isBorrowed;
  formElements.status.value = isBorrowed
    ? "borrowed"
    : (book.status || "available").toLowerCase();

  const modal = document.getElementById("adminEdit");
  modal.dataset.bookId = book.id;
  modal.style.display = "flex";
  document.body.classList.add("modal-open");
}

async function handleAddBook(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    category: document.getElementById("category").value.trim(),
    isbn: document.getElementById("isbn").value.trim(),
  };

  if (Object.values(formData).some((value) => !value)) {
    alert("Please fill in all fields");
    return;
  }

  if (!validateISBN(formData.isbn)) {
    alert("Please enter a valid 10 or 13-digit ISBN number");
    return;
  }

  try {
    const response = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to add book");

    alert("Book added successfully!");
    closeModal();
    await loadBooks();
    document.getElementById("addBookForm").reset();
  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Failed to add book. Please try again.");
  }
}

async function handleEditBook(e) {
  e.preventDefault();

  const bookId = document.getElementById("adminEdit").dataset.bookId;
  const formData = {
    title: document.getElementById("titleEdit").value.trim(),
    author: document.getElementById("authorEdit").value.trim(),
    category: document.getElementById("categoryEdit").value.trim(),
    isbn: document.getElementById("isbnEdit").value.trim(),
    status: document.getElementById("statusEdit").value,
  };

  if (Object.values(formData).some((value) => !value)) {
    alert("Please fill in all fields");
    return;
  }

  if (!validateISBN(formData.isbn)) {
    alert("Please enter a valid 10 or 13-digit ISBN number");
    return;
  }

  try {
    const response = await fetch(`/api/admin/books/${bookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update book");

    alert("Book updated successfully!");
    closeModal();
    await loadBooks();
  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Failed to update book. Please try again.");
  }
}

function showDeleteModal(bookId) {
  if (!bookId) {
    console.error("No book ID provided to showDeleteModal");
    return;
  }

  const modal = document.getElementById("modalDelete");
  if (!modal) {
    console.error("Delete modal not found");
    return;
  }

  modal.dataset.bookId = bookId;
  modal.style.display = "flex";
  document.body.classList.add("modal-open");
}

async function handleDeleteBook() {
  const modal = document.getElementById("modalDelete");
  const bookId = modal.dataset.bookId;

  if (!bookId) {
    console.error("No book ID found for deletion");
    alert("Error: Could not find book to delete");
    return;
  }

  try {
    const response = await fetch(`/api/admin/books/${bookId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete book");

    alert(data.message || "Book deleted successfully");
    closeModal();
    await loadBooks();
  } catch (error) {
    console.error("Error deleting book:", error);
    alert(error.message || "Failed to delete book. Please try again.");
  }
}

function validateISBN(isbn) {
  const isbnRegex = /^(?:\d{10}|\d{13}|\d{3}-\d{10})$/;
  return isbnRegex.test(isbn.replace(/-/g, ""));
}

document.addEventListener("DOMContentLoaded", function () {
  const deleteConfirmBtn = document.querySelector(".delete-confirm-btn");
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", handleDeleteBook);
  }

  const cancelButtons = document.querySelectorAll(".cancel-btn");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });
});
