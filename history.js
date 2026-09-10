import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAOLlqzezG31BE97H4IcKo0DPHwVjKbUfG",
  authDomain: "shanlang-167ed.firebaseapp.com",
  projectId: "shanlang-167ed",
  storageBucket: "shanlang-167ed.firebasestorage.app",
  messagingSenderId: "1007124980142",
  appId: "1:1007124980142:web:2eaac00729da040e75e83f",
  measurementId: "G-6RZVB443C4"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const historyList = document.getElementById("historyList");

// =========================
// PAGINATION
// =========================

const previousPage = document.getElementById("previousPage");
const nextPage = document.getElementById("nextPage");

const currentPageNumber =
  document.getElementById("currentPageNumber");

const totalPagesDisplay = 
  document.getElementById("totalPages");

const pageInfoNumber =
  document.getElementById("pageInfoNumber");

const pageInfoTotal =
  document.getElementById("pageInfoTotal");

const pageSelect =
  document.getElementById("pageSelect");

const pageSelectTotal =
  document.getElementById("pageSelectTotal");


let currentPage = 1;

const ordersPerPage = 20;

let filteredOrders = [];

async function renderHistory(searchTerm = "") {

  historyList.innerHTML = "";

  try {

    const querySnapshot = await getDocs(
      collection(db, "orders")
    );

    const orders = [];

    querySnapshot.forEach((docSnap) => {

      const order = docSnap.data();

      if (order.status === "completed") {

        orders.push({
          id: docSnap.id,
          ...order
        });

      }

    });


    // Oldest completed orders first
    orders.sort((a, b) => {
      return new Date(a.dateTime) - new Date(b.dateTime);
    });
    // =========================
// FILTER SEARCH RESULTS
// =========================

filteredOrders = orders.filter((order) => {

  if (!searchTerm) return true;

  const search = searchTerm.toLowerCase();

  return (
    (order.name || "").toLowerCase().includes(search) ||
    (order.cake || "").toLowerCase().includes(search)
  );

});


// =========================
// PAGINATION
// =========================

const totalPageCount = Math.max(
  1,
  Math.ceil(filteredOrders.length / ordersPerPage)
);

// Keep page valid after searching/deleting
if (currentPage > totalPageCount) {
  currentPage = totalPageCount;
}

const startIndex = (currentPage - 1) * ordersPerPage;
const endIndex = startIndex + ordersPerPage;

const pageOrders = filteredOrders.slice(
  startIndex,
  endIndex
);


// =========================
// UPDATE PAGINATION UI
// =========================

previousPage.disabled = currentPage === 1;
nextPage.disabled = currentPage === totalPageCount;

// Current page
currentPageNumber.textContent = currentPage;

// Total pages
totalPagesDisplay.textContent = totalPageCount;

// Page information
pageInfoNumber.textContent = currentPage;
pageInfoTotal.textContent = totalPageCount;

// Dropdown total
pageSelectTotal.textContent = totalPageCount;


// =========================
// FILL PAGE DROPDOWN
// =========================

pageSelect.innerHTML = "";

for (let i = 1; i <= totalPageCount; i++) {

  const option = document.createElement("option");

  option.value = i;
  option.textContent = i;

  if (i === currentPage) {
    option.selected = true;
  }

  pageSelect.appendChild(option);

}
pageOrders.forEach((order) => {

      const li = document.createElement("li");

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      };


      const formattedDate = new Date(order.dateTime)
        .toLocaleString("en-US", options);


      li.innerHTML = `
        <strong>${order.name} - ${order.cake}</strong>

        <span class="order-details">
          <span>📅 ${formattedDate}</span>
          <span><b>₹</b> ${order.price || 0}</span>
        </span>
      `;


      // =========================
      // RESTORE BUTTON
      // =========================

      const restoreBtn = document.createElement("button");

      restoreBtn.textContent = "Restore";

      restoreBtn.classList.add("restore-btn");

      restoreBtn.addEventListener("click", async () => {

        try {

          // Change completed back to pending
          await updateDoc(
            doc(db, "orders", order.id),
            {
              status: "pending"
            }
          );

          // Remove it from history immediately
          renderHistory();

        } catch (error) {

          console.error("Error restoring order:", error);

          alert("Could not restore the order.");

        }

      });


      


      // Add both buttons
      li.appendChild(restoreBtn);

      historyList.appendChild(li);

    });


  } catch (error) {

    console.error("Error loading order history:", error);

  }

}


renderHistory();
// =========================
// SEARCH HISTORY
// =========================

const searchToggle = document.getElementById("searchToggle");
const searchContainer = document.querySelector(".search-container");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");

searchToggle.addEventListener("click", () => {

  searchContainer.classList.add("search-open");

  setTimeout(() => {
    searchInput.focus();
  }, 300);

});

searchClose.addEventListener("click", () => {

  searchInput.value = "";

  currentPage = 1;

  searchContainer.classList.remove("search-open");

  renderHistory();

});

searchInput.addEventListener("input", () => {

  currentPage = 1;

  renderHistory(searchInput.value.trim());

});
// =========================
// PAGINATION BUTTONS
// =========================

previousPage.addEventListener("click", () => {

  if (currentPage > 1) {

    currentPage--;

    renderHistory(searchInput.value.trim());

  }

});


nextPage.addEventListener("click", () => {

  const totalPageCount = Math.max(
    1,
    Math.ceil(filteredOrders.length / ordersPerPage)
  );

  if (currentPage < totalPageCount) {

    currentPage++;

    renderHistory(searchInput.value.trim());

  }

});


// =========================
// GO TO PAGE
// =========================

pageSelect.addEventListener("change", () => {

  currentPage = Number(pageSelect.value);

  renderHistory(searchInput.value.trim());

});