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


async function renderHistory() {

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


      // =========================
      // DELETE BUTTON
      // =========================

      const deleteBtn = document.createElement("button");

      deleteBtn.textContent = "Delete";

      deleteBtn.classList.add("delete-btn");


      deleteBtn.addEventListener("click", async () => {

        try {

          await deleteDoc(
            doc(db, "orders", order.id)
          );

          renderHistory();

        } catch (error) {

          console.error("Error deleting order:", error);

          alert("Could not delete the order.");

        }

      });


      // Add both buttons
      li.appendChild(restoreBtn);
      li.appendChild(deleteBtn);

      historyList.appendChild(li);

    });


  } catch (error) {

    console.error("Error loading order history:", error);

  }

}


renderHistory();