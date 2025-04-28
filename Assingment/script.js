let budget = 0;
let totalSpent = 0;
let transactions = [];
let editIndex = null;
let categoryChart; // global variable to store Chart.js instance

function setBudget() {
  const budgetInput = document.getElementById('budget').value;
  if (budgetInput > 0) {
    budget = parseFloat(budgetInput);
    updateProgress();
  } else {
    alert("Please enter a valid budget amount.");
  }
}

function addTransaction() {
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (description && amount) {
    const type = category === "Income" ? "Income" : "Expense";

    if (editIndex !== null) {
      let prevTransaction = transactions[editIndex];

      if (prevTransaction.type === "Expense") {
        totalSpent -= prevTransaction.amount;
      }

      if (type === "Expense") {
        totalSpent += amount;
      } else if (type === "Income") {
        budget += amount - prevTransaction.amount;
      }

      transactions[editIndex] = { description, amount, category, type };
      editIndex = null;
      document.querySelector('button[onclick="addTransaction()"]').innerText = "Add";
    } else {
      transactions.push({ description, amount, category, type });
      if (type === "Expense") {
        totalSpent += amount;
      } else {
        budget += amount;
      }
    }

    updateTransactions();
    updateProgress();
    clearForm();
    updateChart();
    saveToLocalStorage();
  } else {
    alert("Please fill in all fields.");
  }
}

function deleteTransaction(index) {
  const trx = transactions[index];

  if (trx.type === "Expense") {
    totalSpent -= trx.amount;
  } else if (trx.type === "Income") {
    budget -= trx.amount;
  }

  transactions.splice(index, 1);
  updateTransactions();
  updateProgress();
  updateChart(); 
  saveToLocalStorage();
}

function editTransaction(index) {
  const trx = transactions[index];

  document.getElementById('description').value = trx.description;
  document.getElementById('amount').value = trx.amount;
  document.getElementById('category').value = trx.category;
  editIndex = index;

  document.querySelector('button[onclick="addTransaction()"]').innerText = "Update";
}

function updateTransactions() {
  const transactionsTable = document.getElementById('transactions');
  transactionsTable.innerHTML = "";

  transactions.forEach((trx, index) => {
    const row = `<tr>
                  <td>${trx.description}</td>
                  <td>${trx.amount.toFixed(2)}</td>
                  <td>${trx.category}</td>
                  <td>${trx.type}</td>
                  <td>
                    <button onclick="editTransaction(${index})">Edit</button>
                    <button onclick="deleteTransaction(${index})">Delete</button>
                  </td>
                </tr>`;
    transactionsTable.innerHTML += row;
  });
}

function updateProgress() {
  let remaining = budget - totalSpent;
  let percentage = budget > 0 ? ((budget - remaining) / budget) * 100 : 0;
  percentage = Math.min(100, percentage);

  document.getElementById('progress-bar').style.width = `${percentage}%`;
  document.getElementById('budget-status').innerText = `Remaining: Rs${remaining.toFixed(2)} / Rs${budget.toFixed(2)}`;

  if (remaining < 0) {
    document.getElementById('budget-status').style.color = "red";
  } else {
    document.getElementById('budget-status').style.color = "green";
  }
}

function clearForm() {
  document.getElementById('description').value = "";
  document.getElementById('amount').value = "";
  document.getElementById('category').value = "Income";
}

// 🥧 Create or Update the Pie Chart
function updateChart() {
  const expenseTransactions = transactions.filter(trx => trx.type === "Expense");

  const categoryTotals = {};

  expenseTransactions.forEach(trx => {
    if (!categoryTotals[trx.category]) {
      categoryTotals[trx.category] = 0;
    }
    categoryTotals[trx.category] += trx.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const colors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses by Category',
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budget', budget);
  }
  window.onload = function() {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions'));
    const savedBudget = parseFloat(localStorage.getItem('budget'));
  
    if (savedTransactions) {
      transactions = savedTransactions;
      updateTransactions();
      updateChart();
    }
  
    if (!isNaN(savedBudget)) {
      budget = savedBudget;
    }
  
    updateProgress();
  };
    