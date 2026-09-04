import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOLlqzezG31BE97H4IcKo0DPHwVjKbUfU",
  authDomain: "shanlang-167ed.firebaseapp.com",
  projectId: "shanlang-167ed",
  storageBucket: "shanlang-167ed.firebasestorage.app",
  messagingSenderId: "1007124980142",
  appId: "1:1007124980142:web:2eaac00729da040e75e83f",
  measurementId: "G-6RZVB443C4"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// =========================
// LOGIN
// =========================

const loginScreen = document.getElementById("loginScreen");
const loginButton = document.getElementById("loginButton");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");


// Check if user is already signed in
onAuthStateChanged(auth, (user) => {

  if (user) {

    // User is logged in
    loginScreen.style.display = "none";

    renderOrders();
    calculateIncome();

  } else {

    // User is not logged in
    loginScreen.style.display = "flex";

  }

});


// Sign in button
loginButton.addEventListener("click", async () => {

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  loginError.textContent = "";

  if (!email || !password) {
    loginError.textContent = "Please enter your email and password.";
    return;
  }

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {

    console.error("Login error:", error);

    loginError.textContent =
      "Incorrect email or password.";

  }

});


// Get HTML elements
const orderForm = document.getElementById("orderForm");
const orderList = document.getElementById("orderList");


// Display orders from Firestore
async function renderOrders() {

  orderList.innerHTML = "";

  try {

    const querySnapshot = await getDocs(
      collection(db, "orders")
    );

    const orders = [];

    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort orders by date and time: earliest first
    orders.sort((a, b) => {
      return new Date(a.dateTime) - new Date(b.dateTime);
    });

   orders.forEach((order) => {

  if (order.status === "completed") {
    return;
  }

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
        <div class="order-name">${order.name} - ${order.cake}</div>
        <div class="order-details">
          <span class="order-date">
            <span class="calendar-icon"></span>
            ${formattedDate}
          </span>
          <span class="order-price">₹ ${order.price || 0}</span>
        </div>
      `;

      // Delete button
     // Complete button
       const completeBtn = document.createElement("button");

       completeBtn.textContent = "Complete";

       completeBtn.addEventListener("click", async () => {

         await updateDoc(
           doc(db, "orders", order.id),
           {
             status: "completed"
           }
        );

});


// Delete button
const deleteBtn = document.createElement("button");

deleteBtn.textContent = "Delete";

deleteBtn.addEventListener("click", async () => {

  await deleteDoc(
    doc(db, "orders", order.id)
  );

  renderOrders();
  calculateIncome();

});

completeBtn.classList.add("complete-btn");
deleteBtn.classList.add("delete-btn");


// =========================
// EDIT BUTTON
// =========================

const editBtn = document.createElement("button");

editBtn.classList.add("edit-btn");

editBtn.innerHTML = `
  <svg
    class="edit-icon"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >

    <!-- Outer corner -->
    <path
      d="M25 10
         H68
         C72 10 74 13 74 17
         C74 21 71 24 67 24
         H32
         V70
         H72
         V53
         C72 48 75 45 80 45
         C85 45 88 48 88 53
         V76
         C88 84 83 90 75 90
         H23
         C14 90 9 84 9 76
         V24
         C9 15 15 10 25 10
         Z"
      fill="currentColor"
    />

    <!-- Pencil -->
    <path
      d="M31 61
         V48
         C31 44 32 41 35 38
         L67 6
         C72 1 79 1 84 6
         L93 15
         C98 20 98 27 93 32
         L61 64
         C58 67 54 69 50 69
         H37
         C33 69 31 66 31 61
         Z"
      fill="currentColor"
    />

    <!-- Pencil tip -->
    <path
      d="M31 61
         L29 76
         L43 69
         Z"
      fill="currentColor"
    />

    <!-- Diamond cutout -->
    <path
      d="M68 15
         L78 5
         L91 18
         L81 28
         Z"
      fill="white"
    />

  </svg>
`;
// =========================
// EDIT ORDER
// =========================

editBtn.addEventListener("click", () => {

  document.getElementById("editName").value = order.name || "";
  document.getElementById("editCake").value = order.cake || "";
  document.getElementById("editPrice").value = order.price || "";
  document.getElementById("editDateTime").value = order.dateTime || "";

  document.getElementById("editPopup").style.display = "flex";


  // OK button
  document.getElementById("editOk").onclick = async () => {

    const newName =
      document.getElementById("editName").value;

    const newCake =
      document.getElementById("editCake").value;

    const newPrice =
      document.getElementById("editPrice").value;

    const newDateTime =
      document.getElementById("editDateTime").value;


    try {

      await updateDoc(
        doc(db, "orders", order.id),
        {
          name: newName,
          cake: newCake,
          price: newPrice,
          dateTime: newDateTime
        }
      );

      document.getElementById("editPopup").style.display = "none";

      renderOrders();
      calculateIncome();

    } catch (error) {

      console.error("Error updating order:", error);

      alert("Could not update the order.");

    }

  };


  // Cancel button
  document.getElementById("editCancel").onclick = () => {

    document.getElementById("editPopup").style.display = "none";

  };

});

li.appendChild(completeBtn);
li.appendChild(editBtn);
li.appendChild(deleteBtn);

orderList.appendChild(li);

    });

  } catch (error) {

    console.error("Error loading orders:", error);

  }
}


// Add new order
orderForm.addEventListener("submit", async (e) => {

  e.preventDefault();


  const name =
    document.getElementById("customerName").value;

  const cake =
    document.getElementById("cakeType").value;

  const price =
    document.getElementById("cakePrice").value;

  const dateTime =
    document.getElementById("orderDateTime").value;


  try {

    // Save to Firestore
    await addDoc(
      collection(db, "orders"),
      {
        name: name,
        cake: cake,
         price: price,
        dateTime: dateTime,
        status: "pending"
      }
    );


    // Clear form
    orderForm.reset();


    // Reload orders
    renderOrders();


  } catch (error) {

    console.error("Error saving order:", error);

    alert("Could not save the order. Check the browser console.");

  }

});

// Calculate Monthly and Annual Income
async function calculateIncome() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "orders")
    );

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyIncome = 0;
    let annualIncome = 0;

    querySnapshot.forEach((docSnap) => {

      const order = docSnap.data();

      if (!order.dateTime) return;

      const orderDate = new Date(order.dateTime);
      const price = Number(order.price) || 0;

      // Annual income
      if (orderDate.getFullYear() === currentYear) {
        annualIncome += price;
      }

      // Monthly income
      if (
        orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonth
      ) {
        monthlyIncome += price;
      }

    });

    document.getElementById("monthlyTotal").textContent =
      monthlyIncome.toLocaleString("en-IN");

    document.getElementById("annualTotal").textContent =
      annualIncome.toLocaleString("en-IN");

  } catch (error) {

    console.error("Error calculating income:", error);

  }

}
