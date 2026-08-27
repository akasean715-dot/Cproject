// Check if browser supports notifications
if ("Notification" in window) {
  Notification.requestPermission();
}

const orderForm = document.getElementById("orderForm");
const orderList = document.getElementById("orderList");
let orders = [];

orderForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("customerName").value;
  const cake = document.getElementById("cakeType").value;
  const dateTime = new Date(document.getElementById("orderDateTime").value);

  const order = { name, cake, dateTime };
  orders.push(order);

  // Create list item
const li = document.createElement("li");
// Format date to 12-hour time with AM/PM
const options = { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric', 
  hour: 'numeric', 
  minute: 'numeric', 
  hour12: true 
};
const formattedDate = order.dateTime.toLocaleString('en-US', options);

li.textContent = `${order.name} - ${order.cake} at ${formattedDate}`;

// Create delete button
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.style.marginLeft = "10px";

// Delete order logic
deleteBtn.addEventListener("click", () => {
  orderList.removeChild(li); // remove from UI
  orders = orders.filter(o => o !== order); // remove from array
});

li.appendChild(deleteBtn);
orderList.appendChild(li);

  // Schedule notification
  const now = new Date();
  const timeUntilOrder = dateTime.getTime() - now.getTime();

  if (timeUntilOrder > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(`Reminder: Bake ${order.cake} for ${order.name}!`);
      }
    }, timeUntilOrder);
  }
});
// --- Backend connection code ---
async function loadOrders() {
  const res = await fetch("http://localhost:3000/orders");
  const orders = await res.json();

  const list = document.getElementById("orderList");
  list.innerHTML = "";

  orders.forEach(order => {
    const li = document.createElement("li");
    li.textContent = `${order.name} - ${order.cake} at ${order.dateTime}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await fetch(`http://localhost:3000/orders/${order.id}`, { method: "DELETE" });
      loadOrders();
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Send new order to backend
document.getElementById("addOrder").addEventListener("click", async () => {
  const name = document.getElementById("customerName").value;
  const cake = document.getElementById("cakeType").value;
  const dateTime = document.getElementById("dateTime").value;

  if (!name || !cake || !dateTime) {
    alert("Please fill all fields!");
    return;
  }

  await fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, cake, dateTime })
  });

  loadOrders();
});

// Load orders when page opens
loadOrders();

