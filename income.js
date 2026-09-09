import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =========================
   FIREBASE
   ========================= */

const firebaseConfig = {
  apiKey: "AIzaSyAOLlqzezG31BE97H4IcKo0DPHwVjKbUfU",
  authDomain: "shanlang-167ed.firebaseapp.com",
  projectId: "shanlang-167ed",
  storageBucket: "shanlang-167ed.firebasestorage.app",
  messagingSenderId: "1007124980142",
  appId: "1:1007124980142:web:2eaac00729da040e75e83f",
  measurementId: "G-6RZVB443C4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================
   ELEMENTS
   ========================= */

const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");

const selectedMonthIncome =
  document.getElementById("selectedMonthIncome");

const completedOrdersCount =
  document.getElementById("completedOrdersCount");

const averageOrderIncome =
  document.getElementById("averageOrderIncome");

const selectedMonthName =
  document.getElementById("selectedMonthName");

const ordersMonthTitle =
  document.getElementById("ordersMonthTitle");

const ordersSectionTotal =
  document.getElementById("ordersSectionTotal");

const incomeOrdersList =
  document.getElementById("incomeOrdersList");

const yearSummaryTitle =
  document.getElementById("yearSummaryTitle");

const yearTotalYear =
  document.getElementById("yearTotalYear");

const yearTotalIncome =
  document.getElementById("yearTotalIncome");


/* =========================
   MONTH NAMES
   ========================= */

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];


/* =========================
   LOAD INCOME
   ========================= */

async function loadIncome() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "orders")
    );

    const orders = [];

    querySnapshot.forEach((docSnap) => {

      const order = docSnap.data();

      /*
       * Only completed orders count as income.
       */
      if (order.status === "completed") {

        orders.push({
          id: docSnap.id,
          ...order
        });

      }

    });


    updateSelectedMonth(orders);
    updateYearlySummary(orders);


  } catch (error) {

    console.error("Error loading income:", error);

  }

}


/* =========================
   SELECTED MONTH
   ========================= */

function updateSelectedMonth(orders) {

  const selectedMonth =
    Number(monthSelect.value);

  const selectedYear =
    Number(yearSelect.value);


  const monthOrders = orders.filter((order) => {

    const date = new Date(order.dateTime);

    return (
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    );

  });


  /* Calculate total */

  let totalIncome = 0;

  monthOrders.forEach((order) => {

    totalIncome += Number(order.price) || 0;

  });


  /* Average */

  const average =
    monthOrders.length > 0
      ? Math.round(totalIncome / monthOrders.length)
      : 0;


  /* Update cards */

  selectedMonthIncome.textContent =
    totalIncome.toLocaleString("en-IN");

  completedOrdersCount.textContent =
    monthOrders.length;

  averageOrderIncome.textContent =
    average.toLocaleString("en-IN");


  const monthYear =
    `${monthNames[selectedMonth]} ${selectedYear}`;

  selectedMonthName.textContent =
    monthYear;

  ordersMonthTitle.textContent =
    monthYear;

  ordersSectionTotal.textContent =
    totalIncome.toLocaleString("en-IN");


  /* Display orders */

  incomeOrdersList.innerHTML = "";


  if (monthOrders.length === 0) {

    incomeOrdersList.innerHTML = `
      <div class="income-no-orders">
        No completed orders for this month.
      </div>
    `;

    return;

  }


  /* Oldest first */

  monthOrders.sort((a, b) => {

    return new Date(a.dateTime) -
           new Date(b.dateTime);

  });


  monthOrders.forEach((order) => {

    const row =
      document.createElement("div");

    row.classList.add("income-order-row");


    const formattedDate =
      new Date(order.dateTime)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });


    row.innerHTML = `

      <span>${formattedDate}</span>

      <span>${order.name || "Unknown"}</span>

      <span>${order.cake || "Unknown"}</span>

      <span class="income-order-price">
        ₹${(Number(order.price) || 0).toLocaleString("en-IN")}
      </span>

      <span>
        <span class="income-completed">
          ✓ Completed
        </span>
      </span>

    `;


    incomeOrdersList.appendChild(row);

  });

}


/* =========================
   YEARLY SUMMARY
   ========================= */

function updateYearlySummary(orders) {

  const selectedYear =
    Number(yearSelect.value);


  yearSummaryTitle.textContent =
    selectedYear;

  yearTotalYear.textContent =
    selectedYear;


  const monthlyTotals =
    Array(12).fill(0);


  orders.forEach((order) => {

    const date =
      new Date(order.dateTime);

    if (date.getFullYear() === selectedYear) {

      const month =
        date.getMonth();

      monthlyTotals[month] +=
        Number(order.price) || 0;

    }

  });


  let yearlyTotal = 0;


  monthlyTotals.forEach((total, index) => {

    yearlyTotal += total;


    const monthElement =
      document.getElementById(`month-${index}`);


    if (monthElement) {

      monthElement.textContent =
        total.toLocaleString("en-IN");

    }

  });


  yearTotalIncome.textContent =
    yearlyTotal.toLocaleString("en-IN");


  /* Highlight selected month */

  document
    .querySelectorAll(".year-month")
    .forEach((box, index) => {

      box.classList.toggle(
        "selected",
        index === Number(monthSelect.value)
      );

    });

}


/* =========================
   MONTH / YEAR CHANGES
   ========================= */

monthSelect.addEventListener(
  "change",
  () => {

    loadIncome();

  }
);


yearSelect.addEventListener(
  "change",
  () => {

    loadIncome();

  }
);


/* =========================
   INITIAL LOAD
   ========================= */

const currentDate = new Date();

monthSelect.value =
  currentDate.getMonth();

yearSelect.value =
  currentDate.getFullYear();

loadIncome();