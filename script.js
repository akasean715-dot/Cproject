// Check if browser supports notifications
if ("Notification" in window) {
  Notification.requestPermission();
}

const orderForm = document.getElementById("orderForm");
const orderList = document.getElementById("orderList");

// Load saved orders from localStorage
let orders = JSON.parse(localStorage.getItem("orders")) || [];
renderOrders();

orderForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("customerName").value;
  const cake = document.getElementById("cakeType").value;
  const dateTime = new Date(document.getElementById("orderDateTime").value);

  const order = { name, cake, dateTime };
  orders.push(order);

  // Save to localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  renderOrders();

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

  orderForm.reset();
});

// Render orders list
function renderOrders() {
  orderList.innerHTML = "";
  orders.forEach((order, index) => {
    const li = document.createElement("li");

    const options = { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true 
    };
    const formattedDate = new Date(order.dateTime).toLocaleString('en-US', options);

    li.textContent = `${order.name} - ${order.cake} at ${formattedDate}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => {
      orders.splice(index, 1);
      localStorage.setItem("orders", JSON.stringify(orders));
      renderOrders();
    };

    li.appendChild(deleteBtn);
    orderList.appendChild(li);
  });
}


