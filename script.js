import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


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
        dateTime: dateTime
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
// Load orders when website opens
renderOrders();
calculateIncome();