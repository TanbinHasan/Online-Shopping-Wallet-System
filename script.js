const user_info = JSON.parse(localStorage.getItem("store")) || [];
let active_user = localStorage.getItem("active") || null;
let product_list = JSON.parse(localStorage.getItem("products")) || [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#loginBtn").addEventListener("click", login);
  document.querySelector("#registerBtn").addEventListener("click", () => showPage("registerPage"));
  document.querySelector("#create_account").addEventListener("click", register);
  document.querySelector("#backToLogin").addEventListener("click", () => showPage("loginPage"));
  document.querySelector("#cashInBtn").addEventListener("click", cashIn);
  document.querySelector("#cashOutBtn").addEventListener("click", cashOut);
  document.querySelector("#buyProducts").addEventListener("click", () => showPage("productPage"));
  document.querySelector("#logoutBtn").addEventListener("click", logout);
  document.querySelector("#backToDashboardBtn").addEventListener("click", () => showPage("walletPage"));
  document.querySelector("#addProductBtn").addEventListener("click", addProduct);

  if (active_user) {
    showPage("walletPage");
    startSessionTimer();
  }
  loadProducts();
  updateTransactionHistory();
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.add("hidden"));
  document.querySelector(`#${pageId}`).classList.remove("hidden");
  if (pageId === "walletPage") updateWalletBalance();
}

function login() {
  const username = document.querySelector("#username_input").value.trim();
  const password = document.querySelector("#password_input").value;
  const user = user_info.find((u) => u.username === username && u.password === password);
  if (!user) {
    alert("Incorrect username or password.");
    return;
  }
  active_user = username;
  localStorage.setItem("active", active_user);
  showPage("walletPage");
  localStorage.setItem("currentActiveUserTime", JSON.stringify(Date.now()));
  startSessionTimer();
}

function register() {
  const username = document.querySelector("#r_username_input").value.trim();
  const password = document.querySelector("#r_password_input").value;
  const confirmPassword = document.querySelector("#confirm_password_input").value;
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
  const amount = parseFloat(document.querySelector("#cashin").value);
  if (isNaN(amount) || amount < 500) {
    alert("Enter a valid amount (minimum 500).");
    return;
  }
  const user = user_info.find((u) => u.username === active_user);
  user.wallet += amount;
  user.transactions.push(`Cash In: +${amount} Taka`);
  while (user.transactions.length > 5) user.transactions.shift();
  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function cashOut() {
  const amount = parseFloat(document.querySelector("#cashout").value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid amount.");
    return;
  }
  const user = user_info.find((u) => u.username === active_user);
  if (amount > user.wallet) {
    alert("Insufficient balance.");
    return;
  }
  user.wallet -= amount;
  user.transactions.push(`Cash Out: -${amount} Taka`);
  while (user.transactions.length > 5) user.transactions.shift();
  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function addProduct() {
  const name = document.querySelector("#product_name").value.trim();
  const price = parseFloat(document.querySelector("#product_price").value);
  if (!name || isNaN(price) || price <= 0) {
    alert("Enter valid product details.");
    return;
  }
  product_list.push({ name, price });
  localStorage.setItem("products", JSON.stringify(product_list));
  document.querySelector("#product_name").value = "";
  document.querySelector("#product_price").value = "";
  loadProducts();
}

function loadProducts() {
  let product_items = document.getElementById("product_items");
  product_items.innerHTML = "";
  product_list.forEach(({ name, price }) => createProduct(name, price));
}

function createProduct(name, price) {
  let product_items = document.getElementById("product_items");
  let div = document.createElement("div");
  let span = document.createElement("span");
  span.innerText = `${name}: ${price} Taka`;
  let btn = document.createElement("button");
  btn.innerText = "Buy";
  btn.addEventListener("click", () => buyProduct(name, price));

  div.appendChild(span);
  div.appendChild(btn);
  product_items.appendChild(div);
}

function buyProduct(name, price) {
  const user = user_info.find((u) => u.username === active_user);
  if (price > user.wallet) {
    alert("Insufficient balance.");
    return;
  }
  alert(`${name} has purchased successfully.`);
  user.wallet -= price;
  user.transactions.push(`Purchased ${name}: -${price} Taka`);
  while (user.transactions.length > 5) user.transactions.shift();
  localStorage.setItem("store", JSON.stringify(user_info));
  updateWalletBalance();
  updateTransactionHistory();
}

function updateWalletBalance() {
  const user = user_info.find((u) => u.username === active_user);
  document.querySelector("#cur_balance").innerText = user.wallet;
}

function updateTransactionHistory() {
  const user = user_info.find((u) => u.username === active_user);
  document.querySelector("#transaction_history").innerHTML = user.transactions
    .map((t) => `<li>${t}</li>`)
    .join("");
}

function logout() {
  active_user = null;
  localStorage.removeItem("active");
  localStorage.removeItem("currentActiveUserTime");
  showPage("loginPage");
}

function startSessionTimer() {
  let intervalID = setInterval(() => {
    const now = JSON.parse(localStorage.getItem("currentActiveUserTime")) + 180 * 1000;
    let dif = now - Date.now();
    let min = Math.floor(dif / (1000 * 60));
    let sec = Math.floor((dif - min * 1000 * 60) / 1000);
    if (min < 10) min = "0" + min;
    if (sec < 10) sec = "0" + sec;
    document.querySelector("#session_timer").innerHTML = `${min} min : ${sec} sec`;
    if (dif <= 0) {
      clearInterval(intervalID);
      alert("Session Timer Has Expired. Please Log in again.");
      logout();
    }
  }, 1000);
}