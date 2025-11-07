// ====================================================
// Proyecto Final JavaScript - Simulador de Conversión
// Autor: Ezequiel Candial
// ====================================================

// ----------------- Clases principales -----------------

class Currency {
  constructor(code, name, type) {
    this.code = code;
    this.name = name;
    this.type = type; // "fiat" o "crypto"
  }
}

class Converter {
  constructor(rates) {
    this.rates = rates; // objeto con cotizaciones
  }

  convert(amount, fromCode, toCode) {
    const fromRate = this.rates[fromCode];
    const toRate = this.rates[toCode];
    if (!fromRate || !toRate) throw new Error("Moneda no encontrada");

    const inUSD = amount / fromRate;
    return inUSD * toRate;
  }
}

// ----------------- Estado global -----------------

const state = {
  currencies: [],
  converter: null,
  balances: {},
  history: [],
  userName: ""
};

const STORAGE_KEY = "simulador_conversion_v2";

// ----------------- Funciones auxiliares -----------------

function isCrypto(code) {
  return ["BTC", "ETH", "USDT", "USDC"].includes(code);
}

function getFullName(code) {
  const map = {
    USD: "Dólar estadounidense",
    EUR: "Euro",
    ARS: "Peso argentino",
    BRL: "Real brasileño",
    CLP: "Peso chileno",
    UYU: "Peso uruguayo",
    BTC: "Bitcoin",
    ETH: "Ethereum",
    USDT: "Tether",
    USDC: "USD Coin"
  };
  return map[code] || code;
}

function saveToStorage() {
  const data = {
    balances: state.balances,
    history: state.history,
    userName: state.userName
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.balances = data.balances || {};
    state.history = data.history || [];
    state.userName = data.userName || "";
  } catch {
    console.error("Error al leer datos guardados.");
  }
}

// ----------------- Renderizado de interfaz -----------------

function renderWelcome() {
  const text = document.getElementById("welcomeText");
  text.textContent = state.userName
    ? `Bienvenido/a, ${state.userName}. Tus datos están guardados en este navegador.`
    : "Podés guardar tu nombre para personalizar tu experiencia.";
}

function renderBalances() {
  const tbody = document.getElementById("balancesTableBody");
  tbody.innerHTML = "";

  state.currencies.forEach((currency) => {
    const balance = state.balances[currency.code] || 0;
    const isCripto = currency.type === "crypto";

    // 🔹 Formateo automático según tipo de moneda
    const decimalPlaces = isCripto ? 6 : 2;
    const formattedBalance = balance.toLocaleString("es-AR", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${currency.code}</td>
      <td>${isCripto ? "Cripto" : "Fiat"}</td>
      <td>${formattedBalance}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCurrencySelects() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  from.innerHTML = "";
  to.innerHTML = "";

  state.currencies.forEach((cur) => {
    const opt1 = document.createElement("option");
    opt1.value = cur.code;
    opt1.textContent = `${cur.code} - ${cur.name}`;
    const opt2 = opt1.cloneNode(true);
    from.appendChild(opt1);
    to.appendChild(opt2);
  });

  from.value = "USD";
  to.value = "ARS";
  document.getElementById("amount").value = 100;
}

function renderHistory(filter = "all") {
  const tbody = document.getElementById("historyTableBody");
  tbody.innerHTML = "";
  const filtered = state.history.filter((h) => {
    if (filter === "all") return true;
    if (filter === "fiat")
      return !isCrypto(h.from) && !isCrypto(h.to);
    if (filter === "crypto")
      return isCrypto(h.from) || isCrypto(h.to);
    return true;
  });

  filtered.forEach((h) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.date}</td>
      <td>${h.from}</td>
      <td>${h.to}</td>
      <td>${h.amountFrom.toFixed(4)}</td>
      <td>${h.amountTo.toFixed(4)}</td>
      <td>${h.applied ? "Sí" : "No"}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderResult(text) {
  document.getElementById("resultBox").textContent = text;
}

// ----------------- SweetAlert helpers -----------------

function showToast(title, icon = "info") {
  Swal.fire({
    title,
    icon,
    toast: true,
    position: "top-end",
    timer: 2200,
    showConfirmButton: false
  });
}

function showError(message) {
  Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonText: "Entendido"
  });
}

// ----------------- Inicialización -----------------

async function init() {
  try {
    const response = await fetch("./data/rates.json");
    const data = await response.json();
    const rates = data.rates;
    state.converter = new Converter(rates);

    state.currencies = Object.keys(rates).map((code) => {
      const type = isCrypto(code) ? "crypto" : "fiat";
      return new Currency(code, getFullName(code), type);
    });

    // Saldos por defecto
    const defaultBalances = {
      USD: 1000, EUR: 500, ARS: 250000,
      BRL: 2000, CLP: 100000, UYU: 15000,
      BTC: 0.01, ETH: 0.4, USDT: 300, USDC: 150
    };
    state.balances = { ...defaultBalances };

    loadFromStorage();
    renderCurrencySelects();
    renderBalances();
    renderHistory();
    renderWelcome();

    showToast("Datos cargados correctamente", "success");
  } catch (error) {
    showError("Error al cargar rates.json");
  }

  setupEvents();
}

// ----------------- Eventos -----------------

function setupEvents() {
  // Guardar usuario
  document.getElementById("userForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("userName").value.trim();
    if (!name) return showError("Ingresá un nombre válido.");
    state.userName = name;
    saveToStorage();
    renderWelcome();
    showToast("Nombre guardado", "success");
  });

  // Conversión
  document.getElementById("convertForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const from = document.getElementById("fromCurrency").value;
    const to = document.getElementById("toCurrency").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const apply = document.getElementById("applyToWallet").checked;

    if (from === to) return showError("Las monedas deben ser distintas.");
    if (isNaN(amount) || amount <= 0)
      return showError("Ingresá un monto válido.");
    if (apply && state.balances[from] < amount)
      return showError(`Saldo insuficiente en ${from}.`);

    try {
  const result = state.converter.convert(amount, from, to);
  const decimalPlaces = isCrypto(to) ? 6 : 2;
  const formattedResult = result.toLocaleString("es-AR", {
    maximumFractionDigits: decimalPlaces
  });
  renderResult(`${amount} ${from} = ${formattedResult} ${to}`);

  if (apply) {
    state.balances[from] -= amount;
    state.balances[to] = (state.balances[to] || 0) + result;
    renderBalances();
  }

  const now = new Date();
  state.history.unshift({
    date: now.toLocaleString(),
    from,
    to,
    amountFrom: amount,
    amountTo: result,
    applied: apply
  });

  renderHistory(document.getElementById("filterType").value);
  saveToStorage();

  Swal.fire({
  title: "Conversión exitosa",
  html: `<b>${amount} ${from}</b> = <b>${formattedResult} ${to}</b><br>${
    apply ? "Impactó en la cartera." : "Solo simulación."
  }`,
  icon: "success",
  confirmButtonText: "Aceptar"
  });

} catch {
  showError("Error en la conversión.");
}

  });

  // Filtro de historial
  document.getElementById("filterType").addEventListener("change", (e) => {
    renderHistory(e.target.value);
  });
}

// ----------------- Iniciar aplicación -----------------
document.addEventListener("DOMContentLoaded", init);
