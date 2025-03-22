// === Manage Products Script === //
// filename: manage_products.js

// ==================== Global Helper Functions ==================== //
/**
 * Escapes HTML special characters to prevent XSS attacks.
 */
function escapeHtml(unsafe) {
  return unsafe
    ? unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    : "";
}

/**
 * Formats a number into Indonesian Rupiah currency format.
 */
function formatPrice(amount) {
  return (
    Number(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ",00"
  );
}

/**
 * Retrieves the CSRF token from the meta tag.
 */
function getCsrfToken() {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  if (!csrfToken) {
    throw new Error("CSRF token not found.");
  }
  return csrfToken;
}

/**
 * Handles API responses and throws errors for non-OK responses.
 */
async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Shows a notification message (replaces alert).
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

/**
 * Debounce function to limit the rate of function execution.
 */
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to open the product edit page in a new tab
function editProduct(slug, encodedId) {
  window.open(`${BASE_URL}edit-product/${slug}/${encodedId}`, "_blank");
}
// ==================== Akhir Global Helper Functions ==================== //

// ==================== JS untuk Pagination ==================== //
async function fetchProducts(page = 1, limit = 10, keyword = "", categoryId = "") {
  try {
    let url = `${BASE_URL}api-proxy.php?action=get_all_products&page=${page}&limit=${limit}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (categoryId) url += `&category_id=${categoryId}`;

    const response = await fetch(url, { credentials: "include" });
    const data = await handleResponse(response);

    if (data.success) {
      updateTable(data.products);
      updatePagination(data.pagination);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showNotification(`Failed to load data: ${error.message}`, "error");
  }
}

function updatePagination(pagination) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;

  const { total_pages, current_page } = pagination;
  let paginationHTML = "";

  // Tombol Previous
  if (current_page > 1) {
    paginationHTML += `
      <li class="page-item">
          <a class="page-link" href="#" data-page="${current_page - 1}">Previous</a>
      </li>`;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
      </li>`;
  }

  // Tombol Halaman
  for (let i = 1; i <= total_pages; i++) {
    paginationHTML += `
          <li class="page-item ${i === current_page ? "active" : ""}">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>`;
  }

  // Tombol Next
  if (current_page < total_pages) {
    paginationHTML += `
      <li class="page-item">
          <a class="page-link" href="#" data-page="${current_page + 1}">Next</a>
      </li>`;
  } else {
    paginationHTML += `
      <li class="page-item disabled">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Next</a>
      </li>`;
  }

  paginationContainer.innerHTML = paginationHTML;

  // Tambahkan event listener untuk tombol pagination
  paginationContainer.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");
      const keyword = document.getElementById("searchInput").value.trim();
      const categoryId = document.getElementById("categoryFilter").value || null;
      searchProducts(keyword, page, 10, categoryId); // Ambil halaman yang dipilih dengan keyword dan filter kategori
    });
  });
}
// ==================== Akhir JS untuk Pagination ==================== //

// ==================== JS untuk Checkboxes dan Delete Selected ==================== //
/**
 * Toggles the visibility of the "Delete Selected" button.
 */
function updateDeleteButtonVisibility() {
  const checkboxes = document.querySelectorAll(".product-checkbox");
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  if (deleteSelectedBtn) {
    deleteSelectedBtn.classList.toggle("d-none", ![...checkboxes].some((cb) => cb.checked));
  }
}

/**
 * Handles bulk deletion of selected products.
 */
async function deleteSelectedProducts() {
  try {
    const selectedProducts = Array.from(document.querySelectorAll(".product-checkbox:checked")).map((cb) => cb.value);

    if (selectedProducts.length === 0) {
      showNotification("Please select at least one product!", "error");
      return;
    }

    const response = await fetch(`${BASE_URL}api-proxy.php?action=delete_selected_products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCsrfToken(),
      },
      body: JSON.stringify({ product_ids: selectedProducts }),
      credentials: "include",
    });

    const data = await handleResponse(response);

    if (!data.error) {
      showNotification("Selected products deleted successfully!", "success");

      selectedProducts.forEach((productId) => {
        const row = document.querySelector(`.product-checkbox[value="${productId}"]`)?.closest("tr");
        if (row) {
          row.remove();
        }
      });

      updateDeleteButtonVisibility();

      // Redirect to the manage products page after a short delay
      setTimeout(() => {
        window.location.href = `${BASE_URL}manage_products`;
      }, 1500);
    } else {
      if (data.failed_products?.length > 0) {
        const errorMessages = data.failed_products.map((fp) => `Product ID ${fp.id}: ${fp.message}`).join("\n");
        showNotification(`Failed to delete some products:\n${errorMessages}`, "error");
      } else {
        showNotification("Failed to delete some products.", "error");
      }
    }
  } catch (error) {
    showNotification(`An error occurred: ${error.message}`, "error");
    console.error("Delete selected products error:", error);
  }
}

/**
 * Updates the products table by rendering a paginated list of products.
 *
 * @param {Array} products - An array of product objects to be displayed.
 * @param {number} [currentPage=1] - The current page number for pagination.
 * @param {number} [limit=10] - The number of products to display per page.
 */
function updateTable(products, currentPage = 1, limit = 10) {
  const tbody = document.getElementById("productsTableBody");
  tbody.innerHTML = "";

  products.forEach((product, index) => {
    const row = document.createElement("tr");
    const rowNumber = (currentPage - 1) * limit + index + 1;
    const status = product.active.toLowerCase();
    const badgeClass = status === "active" ? "success" : "danger";

    row.innerHTML = `
          <td>
              <input type="checkbox" name="selected_products[]" 
                     value="${escapeHtml(product.product_id)}"
                     class="product-checkbox">
              ${rowNumber}
          </td>
          <td>${escapeHtml(product.product_name)}</td>
          <td>${escapeHtml(product.categories || "Uncategorized")}</td>
          <td>
              <div class="dropdown">
                  <button class="btn btn-sm badge bg-${badgeClass} dropdown-toggle" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                      ${product.active === "active" ? "Active" : "Inactive"}
                  </button>
                  <ul class="dropdown-menu">
                      <li>
                          <a class="dropdown-item ${status === "active" ? "disabled" : ""}" 
                             href="#" 
                             data-product-id="${product.product_id}"
                             data-new-status="active">
                              Active
                          </a>
                      </li>
                      <li>
                          <a class="dropdown-item ${status === "inactive" ? "disabled" : ""}" 
                             href="#" 
                             data-product-id="${product.product_id}"
                             data-new-status="inactive">
                              Inactive
                          </a>
                      </li>
                  </ul>
              </div>
          </td>
          <td>Rp ${formatPrice(product.price_amount)}</td>
          <td>
              <button class="btn btn-info btn-sm" onclick="viewDetails(${escapeHtml(product.product_id)})">
                  <i class="fas fa-eye"></i> View Details
              </button>
              <button class="btn btn-warning btn-sm" onclick="editProduct('${escapeHtml(product.slug)}', '${escapeHtml(
      product.encoded_id,
    )}')">
                  <i class="fas fa-edit"></i> Edit
              </button>
          </td>
      `;
    tbody.appendChild(row);
  });

  updateDeleteButtonVisibility();
}

/**
 * Fetches and updates products based on a category filter.
 */
async function filterProductsByCategory(categoryId, page = 1, limit = 10) {
  try {
    const url = `${BASE_URL}api-proxy.php?action=get_products_by_category${
      categoryId ? `&category_id=${categoryId}` : ""
    }&page=${page}&limit=${limit}`;
    const response = await fetch(url, { credentials: "include" });
    const data = await handleResponse(response);
    if (data.success) {
      updateTable(data.products, page, limit);
      updatePagination(data.pagination);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showNotification(`Failed to load data: ${error.message}`, "error");
  }
}

/**
 * Fetches and updates products based on a search keyword and category filter.
 */
async function searchProducts(keyword, page = 1, limit = 10, categoryId = null) {
  try {
    let url = `${BASE_URL}api-proxy.php?action=get_search_products&keyword=${encodeURIComponent(
      keyword,
    )}&page=${page}&limit=${limit}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }

    const response = await fetch(url, { credentials: "include" });
    const data = await handleResponse(response);
    if (data.success) {
      updateTable(data.products, page, limit);
      updatePagination(data.pagination);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showNotification(`Network error: ${error.message}`, "error");
  }
}

// ==================== JS untuk Tagify ==================== //
let tagify = null;

function initializeTagify() {
  const input = document.getElementById("productTags");
  if (tagify) tagify.destroy();

  tagify = new Tagify(input, {
    whitelist: TAGS_WHITELIST,
    dropdown: { enabled: 1, maxItems: 50, closeOnSelect: false, highlightFirst: true },
    enforceWhitelist: false,
    editTags: true,
    duplicates: false,
    placeholder: "Enter tags",
    maxTags: 10,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
  });

  tagify.on("add", (e) => {
    const tagValue = e.detail.data.value;
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tagValue)) {
      showNotification(`Invalid tag: ${tagValue}`, "error");
      tagify.removeTag(e.detail.tag);
    }
    if (tagify.value.length > 10) {
      showNotification("Max 10 tags allowed", "error");
      tagify.removeTag(e.detail.tag);
    }
  });
}

// ==================== JS untuk Modal Detail Product ==================== //
function viewDetails(productId) {
  console.log("Loading product details:", productId);

  // Get CSRF token from meta tag
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  // Construct the API proxy URL
  const apiUrl = `${BASE_URL}api-proxy.php?action=get_product_details&product_id=${productId}`;

  // Perform a fetch request to retrieve product details
  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
  })
    .then((response) => {
      // Check if the response is not OK (status not in the 200-299 range)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response, handling potential parsing errors
      return response.json().catch(() => {
        throw new Error("Invalid JSON response");
      });
    })
    .then((data) => {
      // If the API response indicates success
      if (data.success) {
        const product = data.product;

        // Update modal content with product details
        document.getElementById("detailProductName").textContent = product.name;
        document.getElementById("detailProductDescription").textContent = product.description;
        document.getElementById("detailProductPrice").textContent = `Rp ${parseInt(product.price).toLocaleString(
          "id-ID",
        )},00`;
        document.getElementById("detailProductCurrency").textContent = product.currency;
        document.getElementById("detailProductCategories").textContent = product.categories;
        document.getElementById("detailProductTags").textContent = product.tags;
        document.getElementById("detailProductCreatedAt").textContent = new Date(product.created_at).toLocaleString(
          "id-ID",
        );
        document.getElementById("detailProductUpdatedAt").textContent = new Date(product.updated_at).toLocaleString(
          "id-ID",
        );

        // Handle product image display with carousel
        const carouselInner = document.getElementById("detailProductImagesContainer");
        carouselInner.innerHTML = ""; // Bersihkan konten sebelumnya

        if (product.images && product.images.length > 0) {
          product.images.forEach((image, index) => {
            const carouselItem = document.createElement("div");
            carouselItem.className = `carousel-item ${index === 0 ? "active" : ""}`;

            const img = document.createElement("img");
            img.src = `${BASE_URL}${image}`;
            img.alt = "Product Image";
            img.className = "d-block w-100 product-image";

            // Tambahkan fitur zoom pada gambar
            img.addEventListener("click", () => {
              img.classList.toggle("zoom");
            });

            carouselItem.appendChild(img);
            carouselInner.appendChild(carouselItem);
          });
        } else {
          // Tampilkan gambar default jika tidak ada gambar
          const carouselItem = document.createElement("div");
          carouselItem.className = "carousel-item active";
          const img = document.createElement("img");
          img.src = `${BASE_URL}assets/images/no-image.jpg`;
          img.alt = "No image available";
          img.className = "d-block w-100";
          carouselItem.appendChild(img);
          carouselInner.appendChild(carouselItem);
        }

        // Show the product details modal
        new bootstrap.Modal(document.getElementById("productDetailsModal")).show();
      } else {
        // Handle server error response
        console.error("Error from server:", data.error);
        alert(`Error: ${data.error || "An unknown error occurred"}`);
      }
    })
    .catch((error) => {
      // Handle fetch errors
      console.error("Failed to load product details:", error);
      alert("Failed to load product details. Please check the console for more information.");
    });
}

// ==================== JS untuk Update Status Produk ==================== //

/**
 * Handles the status update for a product when a dropdown item is clicked.
 * @param {Event} event - The event triggered by clicking a dropdown item.
 */
function handleStatusUpdate(event) {
  event.preventDefault();
  console.log("[DEBUG] handleStatusUpdate triggered");

  // Find the closest dropdown item
  const item = event.target.closest(".dropdown-item");
  if (!item) {
    console.warn("[WARNING] No valid dropdown item found.");
    return;
  }

  // Prevent action if item is disabled
  if (item.classList.contains("disabled")) {
    console.info("[INFO] Item is disabled, aborting.");
    return;
  }

  const productId = item.dataset.productId;
  const newStatus = item.dataset.newStatus;

  console.log(`[DEBUG] Product ID: ${productId}, New Status: ${newStatus}`);

  // Confirm action with user
  if (!confirm(`Are you sure you want to set this product to ${newStatus}?`)) {
    console.info("[INFO] User cancelled the action.");
    return;
  }

  // Send request to update status
  fetch(`${BASE_URL}api-proxy.php?action=update_product_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      new_status: newStatus,
      csrf_token: getCsrfToken(),
    }),
    credentials: "include",
  })
    .then((response) => response.text()) // Convert response to text first
    .then((text) => {
      console.log("[DEBUG] Raw response text:", text);

      // Coba cari JSON di dalam response, abaikan teks tambahan di awal
      const jsonMatch = text.match(/\{.*\}$/s);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response: " + text);
      }

      return JSON.parse(jsonMatch[0]); // Ambil hanya bagian JSON
    })
    .then((data) => {
      console.log("[DEBUG] Parsed response data:", data);

      if (data.success) {
        console.log("[SUCCESS] Status updated successfully.");
        showNotification("Status updated successfully!", "success");

        setTimeout(() => {
          window.location.href = `${BASE_URL}manage_products`;
        }, 1500);

        // Update UI badge
        const badge = document
          .querySelector(`[data-product-id="${productId}"]`)
          .closest(".dropdown")
          .querySelector(".badge");

        if (badge) {
          console.log("[DEBUG] Updating UI badge:", badge);
          badge.className = `btn btn-sm badge bg-${newStatus === "active" ? "success" : "danger"} dropdown-toggle`;
          badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        } else {
          console.warn("[WARNING] Badge element not found for product ID:", productId);
        }

        // Update dropdown items state
        const dropdownItems = badge.closest(".dropdown").querySelectorAll(".dropdown-item");
        dropdownItems.forEach((item) => {
          item.classList.toggle("disabled", item.dataset.newStatus === newStatus);
        });
      } else {
        console.error("[ERROR] Server response error:", data.message);
        showNotification(data.message || "Failed to update status", "error");
      }
    })
    .catch((error) => {
      console.error("[ERROR] Fetch error:", error);
      showNotification("Error updating status: " + error.message, "error");
    });
}

// ==================== Event Listeners dan Inisialisasi ==================== //
document.addEventListener("DOMContentLoaded", () => {
  // Ambil halaman pertama saat halaman dimuat
  fetchProducts(1);

  // Event delegation untuk checkbox
  document.getElementById("productsTableBody")?.addEventListener("change", (e) => {
    if (e.target.classList.contains("product-checkbox")) {
      updateDeleteButtonVisibility();
    }
  });

  // Select All Button
  const selectAllButton = document.getElementById("manage_products-selectAllButton");
  if (selectAllButton) {
    selectAllButton.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".product-checkbox");
      const isAnyUnchecked = [...checkboxes].some((cb) => !cb.checked);
      checkboxes.forEach((cb) => (cb.checked = isAnyUnchecked));
      updateDeleteButtonVisibility();
    });
  }

  // Delete Selected Button
  document.getElementById("confirmDeleteSelected")?.addEventListener("click", deleteSelectedProducts);

  // Filter Category
  document.getElementById("categoryFilter")?.addEventListener("change", (e) => {
    const categoryId = e.target.value || null;
    const keyword = document.getElementById("searchInput").value.trim();
    searchProducts(keyword, 1, 10, categoryId); // Ambil halaman pertama dengan keyword dan filter kategori
  });

  // Search Bar
  const searchInput = document.getElementById("searchInput");
  const debouncedSearch = debounce(() => {
    const keyword = searchInput.value.trim();
    const categoryId = document.getElementById("categoryFilter").value || null;
    searchProducts(keyword, 1, 10, categoryId);
  }, 300);

  searchInput?.addEventListener("input", debouncedSearch);

  // Tagify
  $("#addProductModal").on("shown.bs.modal", initializeTagify);
  $("#addProductModal").on("hidden.bs.modal", () => {
    if (tagify) tagify.destroy();
  });

  // Maksimal 10 gambar
  document.getElementById("addProductForm").addEventListener("submit", function (event) {
    const files = document.getElementById("productImages").files;
    if (files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      event.preventDefault();
    }
  });

  // Di bagian Event Listeners, tambahkan:
  document.addEventListener("click", function (e) {
    const toggle = e.target.closest(".dropdown-toggle");
    if (toggle) {
      const dropdown = new bootstrap.Dropdown(toggle);
      dropdown.toggle();
    }
  });

  document.getElementById("productsTableBody")?.addEventListener("click", (e) => {
    const dropdownItem = e.target.closest(".dropdown-item[data-product-id][data-new-status]");
    if (dropdownItem) {
      handleStatusUpdate(e);
    }
  });
});
// ==================== Akhir Event Listeners dan Inisialisasi ==================== //
