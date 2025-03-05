const user_info = JSON.parse(localStorage.getItem("store") || "[]");
let active_user = localStorage.getItem("active") || null;
let product_list = JSON.parse(localStorage.getItem("products") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#loginBtn");
  const registerBtn = document.querySelector("#registerBtn");
  const createAccountBtn = document.querySelector("#create_account");
  const backToLoginBtn = document.querySelector("#backToLogin");
  const cashInBtn = document.querySelector("#cashInBtn");
  const cashOutBtn = document.querySelector("#cashOutBtn");
  const buyProductsBtn = document.querySelector("#buyProducts");
  const logoutBtn = document.querySelector("#logoutBtn");
  const backToDashboardBtn = document.querySelector("#backToDashboardBtn");
  const addProductBtn = document.querySelector("#addProductBtn");

  if (loginBtn) loginBtn.addEventListener("click", login);
  if (registerBtn) registerBtn.addEventListener("click", () => showPage("registerPage"));
  if (createAccountBtn) createAccountBtn.addEventListener("click", register);
  if (backToLoginBtn) backToLoginBtn.addEventListener("click", () => showPage("loginPage"));
  if (cashInBtn) cashInBtn.addEventListener("click", cashIn);
  if (cashOutBtn) cashOutBtn.addEventListener("click", cashOut);
  if (buyProductsBtn) buyProductsBtn.addEventListener("click", () => showPage("productPage"));
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (backToDashboardBtn) backToDashboardBtn.addEventListener("click", () => showPage("walletPage"));
  if (addProductBtn) addProductBtn.addEventListener("click", addProduct);

  if (active_user) {
    showPage("walletPage");
    startSessionTimer();
  }
  loadProducts();
  updateTransactionHistory();
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.add("hidden"));
  const page = document.querySelector(`#${pageId}`);
  if (page) page.classList.remove("hidden");
  if (pageId === "walletPage") updateWalletBalance();
}

function login() {
  const usernameInput = document.querySelector("#username_input");
  const passwordInput = document.querySelector("#password_input");

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const user = user_info.find((u) => u.username === username && u.password === password);
  if (!user) {
    alert("Incorrect username or password.");
    return;
  }
  active_user = username;
  localStorage.setItem("active", active_user);
  localStorage.setItem("currentActiveUserTime", JSON.stringify(Date.now()));
  showPage("walletPage");
  startSessionTimer();
}

function register() {
  const usernameInput = document.querySelector("#r_username_input");
  const passwordInput = document.querySelector("#r_password_input");
  const confirmPasswordInput = document.querySelector("#confirm_password_input");

  if (!usernameInput || !passwordInput || !confirmPasswordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!username || !password) {
    alert("Username and password cannot be empty.");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  if (user_info.find((u) => u.username === username)) {
    alert("Username already exists.");
    return;
  }
  user_info.push({ username, password, wallet: 0, transactions: [] });
  localStorage.setItem("store", JSON.stringify(user_info));
  alert("Account created successfully.");
  showPage("loginPage");
}

function cashIn() {
  const cashInInput = document.querySelector("#cashin");
  if (!cashInInput) return;

  const amount = parseFloat(cashInInput.value);
  if (isNaN(amount) || amount < 500) {
    alert("Enter a valid amount (minimum 500).");
    return;
  }
  const user = user_info.find((u) => u.username === active_user);
  if (!user) return;

  user.wallet += amount;
  user.transactions.push(`Cash In: +${amount} Taka`);
  user.transactions = user.transactions.slice(-5);
  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function cashOut() {
  const cashOutInput = document.querySelector("#cashout");
  if (!cashOutInput) return;

  const amount = parseFloat(cashOutInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid amount.");
    return;
  }
  const user = user_info.find((u) => u.username === active_user);
  if (!user || amount > user.wallet) {
    alert("Insufficient balance.");
    return;
  }
  user.wallet -= amount;
  user.transactions.push(`Cash Out: -${amount} Taka`);
  user.transactions = user.transactions.slice(-5);
  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function addProduct() {
  const nameInput = document.querySelector("#product_name");
  const priceInput = document.querySelector("#product_price");

  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!name || isNaN(price) || price <= 0) {
    alert("Enter valid product details.");
    return;
  }

  product_list.push({ name, price });
  localStorage.setItem("products", JSON.stringify(product_list));

  nameInput.value = "";
  priceInput.value = "";

  loadProducts();
}

function loadProducts() {
  const productItems = document.getElementById("product_items");
  if (!productItems) return;

  productItems.innerHTML = "";
  product_list.forEach(({ name, price }) => createProduct(name, price));
}

function createProduct(name, price) {
  const productItems = document.getElementById("product_items");
  if (!productItems) return;

  const div = document.createElement("div");
  const span = document.createElement("span");
  span.innerText = `${name}: ${price} Taka`;

  const btn = document.createElement("button");
  btn.innerText = "Buy";
  btn.addEventListener("click", () => buyProduct(name, price));

  div.appendChild(span);
  div.appendChild(btn);
  productItems.appendChild(div);
}

function buyProduct(name, price) {
  const user = user_info.find((u) => u.username === active_user);
  if (!user) return;

  if (price > user.wallet) {
    alert("Insufficient balance.");
    return;
  }

  alert(`${name} has been purchased successfully.`);
  user.wallet -= price;
  user.transactions.push(`Purchased ${name}: -${price} Taka`);
  user.transactions = user.transactions.slice(-5);

  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function updateWalletBalance() {
  const balanceSpan = document.querySelector("#cur_balance");
  if (!balanceSpan) return;

  const user = user_info.find((u) => u.username === active_user);
  if (user) balanceSpan.innerText = user.wallet;
}

function updateTransactionHistory() {
  const historyList = document.querySelector("#transaction_history");
  if (!historyList) return;

  const user = user_info.find((u) => u.username === active_user);
  if (user) {
    historyList.innerHTML = user.transactions.map((t) => `<li>${t}</li>`).join("");
  }
}

function logout() {
  active_user = null;
  localStorage.removeItem("active");
  localStorage.removeItem("currentActiveUserTime");
  showPage("loginPage");
}

function startSessionTimer() {
  const sessionTimer = document.querySelector("#session_timer");
  if (!sessionTimer) return;

  const expirationTime = JSON.parse(localStorage.getItem("currentActiveUserTime")) + 180 * 1000;

  const updateTimer = () => {
    const remainingTime = expirationTime - Date.now();
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const min = String(Math.floor(remainingTime / 60000)).padStart(2, "0");
    const sec = String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, "0");
    sessionTimer.innerText = `${min} min : ${sec} sec`;
  };

  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}