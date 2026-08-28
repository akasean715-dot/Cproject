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

    querySnapshot.forEach((docSnap) => {

      const order = docSnap.data();

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

      li.textContent =
        `${order.name} - ${order.cake} at ${formattedDate}`;


      // Delete button
      const deleteBtn = document.createElement("button");

      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";


      deleteBtn.addEventListener("click", async () => {

        await deleteDoc(
          doc(db, "orders", docSnap.id)
        );

        renderOrders();

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

  const dateTime =
    document.getElementById("orderDateTime").value;


  try {

    // Save to Firestore
    await addDoc(
      collection(db, "orders"),
      {
        name: name,
        cake: cake,
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


// Load orders when website opens
renderOrders();
