const quantitySInput = document.querySelector("#quantity-s");
const quantityMInput = document.querySelector("#quantity-m");
const orderMethodSelect = document.querySelector("#order-method");
const postageFields = document.querySelector("#postage-fields");
const pickupGuide = document.querySelector("#pickup-guide");
const postageGuide = document.querySelector("#postage-guide");
const deliveryGuide = document.querySelector("#delivery-guide");
const totalDisplay = document.querySelector("#total-display");
const summaryNote = document.querySelector("#summary-note");
const stockLeftDisplayS = document.querySelector("#stock-left-display-s");
const stockLeftDisplayM = document.querySelector("#stock-left-display-m");
const customerNameInput = document.querySelector("#customer-name");
const customerPhoneInput = document.querySelector("#customer-phone");
const receiverNameInput = document.querySelector("#receiver-name");
const receiverPhoneInput = document.querySelector("#receiver-phone");
const street1Input = document.querySelector("#street-1");
const street2Input = document.querySelector("#street-2");
const cityInput = document.querySelector("#city");
const postcodeInput = document.querySelector("#postcode");
const stateInput = document.querySelector("#state");
const orderNotesInput = document.querySelector("#order-notes");
const orderFormFields = document.querySelector("#order-form-fields");
const sendOrderButton = document.querySelector("#send-order-button");
const sendReceiptButton = document.querySelector("#send-receipt-button");
const openSettingsButton = document.querySelector("#open-settings-button");
const closeSettingsButton = document.querySelector("#close-settings-button");
const settingsPanel = document.querySelector("#settings-panel");
const settingsBackdrop = document.querySelector("#settings-backdrop");
const settingsPasswordInput = document.querySelector("#settings-password");
const unlockSettingsButton = document.querySelector("#unlock-settings-button");
const settingsError = document.querySelector("#settings-error");
const settingsLoginView = document.querySelector("#settings-login-view");
const settingsEditorView = document.querySelector("#settings-editor-view");
const stockInputS = document.querySelector("#stock-input-s");
const stockInputM = document.querySelector("#stock-input-m");
const saveStockButton = document.querySelector("#save-stock-button");
const settingsSuccess = document.querySelector("#settings-success");

const whatsappNumber = "60132283772";
const fallbackSettingsPassword = "cuzicunim";
const stockStorageKeyS = "chubbychubakes_stock_left_s";
const stockStorageKeyM = "chubbychubakes_stock_left_m";
const orderReservationKey = "chubbychubakes_order_reservation_key";
const supabaseConfig = window.ORDERCAKE_SUPABASE_CONFIG || {};
const hasSupabase =
  Boolean(window.supabase) &&
  Boolean(supabaseConfig.url) &&
  Boolean(supabaseConfig.anonKey);
const supabaseClient = hasSupabase
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

const prices = {
  S: 25,
  M: 36,
};

let activeAdminPassword = "";

function canUseLocalFallback(error) {
  return (
    !error ||
    error.code === "PGRST202" ||
    error.code === "PGRST301" ||
    error.message === "Failed to fetch"
  );
}

function normalizeQuantity(input, fallback = 0) {
  const value = Math.min(1000, Math.max(0, Number(input.value) || fallback));
  input.value = value;
  return value;
}

function getCookieQuantities() {
  return {
    quantityS: normalizeQuantity(quantitySInput, 0),
    quantityM: normalizeQuantity(quantityMInput, 0),
  };
}

function getPostageFee(totalJars) {
  if (totalJars <= 0) {
    return 0;
  }

  if (totalJars <= 5) {
    return 8;
  }

  if (totalJars <= 15) {
    return 10;
  }

  return 15;
}

function normalizeStockValue(value) {
  return Math.min(10000, Math.max(0, Number(value) || 0));
}

function getLocalStoredStock() {
  return {
    stockS: normalizeStockValue(window.localStorage.getItem(stockStorageKeyS)),
    stockM: normalizeStockValue(window.localStorage.getItem(stockStorageKeyM)),
  };
}

function renderStockValues({ stockS, stockM }) {
  stockLeftDisplayS.textContent = `Size S: ${stockS} jars`;
  stockLeftDisplayM.textContent = `Size M: ${stockM} jars`;
}

async function getStoredStock() {
  if (!supabaseClient) {
    return getLocalStoredStock();
  }

  const { data, error } = await supabaseClient
    .from("stock_state")
    .select("stock_s, stock_m")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw error || new Error("Unable to load stock");
  }

  return {
    stockS: normalizeStockValue(data.stock_s),
    stockM: normalizeStockValue(data.stock_m),
  };
}

async function renderStock() {
  try {
    renderStockValues(await getStoredStock());
  } catch (error) {
    console.error("Stock sync failed:", error);
    renderStockValues(getLocalStoredStock());
  }
}

function resetOrderReservationStatus() {
  window.sessionStorage.removeItem(orderReservationKey);
}

function getOrderReservationKey() {
  let orderKey = window.sessionStorage.getItem(orderReservationKey);

  if (!orderKey) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      orderKey = window.crypto.randomUUID();
    } else {
      orderKey = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    window.sessionStorage.setItem(orderReservationKey, orderKey);
  }

  return orderKey;
}

async function reserveStockForCurrentOrder() {
  const { quantityS, quantityM } = getCookieQuantities();

  if (quantityS <= 0 && quantityM <= 0) {
    return true;
  }

  if (!supabaseClient) {
    const { stockS, stockM } = getLocalStoredStock();
    const nextStockS = Math.max(0, stockS - quantityS);
    const nextStockM = Math.max(0, stockM - quantityM);
    window.localStorage.setItem(stockStorageKeyS, nextStockS);
    window.localStorage.setItem(stockStorageKeyM, nextStockM);
    renderStockValues({ stockS: nextStockS, stockM: nextStockM });
    return true;
  }

  const { data, error } = await supabaseClient.rpc("reserve_stock", {
    p_order_key: getOrderReservationKey(),
    p_quantity_s: quantityS,
    p_quantity_m: quantityM,
  });

  if (error || !data) {
    console.error("Stock reservation failed:", error);
    if (canUseLocalFallback(error)) {
      const { stockS, stockM } = getLocalStoredStock();
      const nextStockS = Math.max(0, stockS - quantityS);
      const nextStockM = Math.max(0, stockM - quantityM);
      window.localStorage.setItem(stockStorageKeyS, nextStockS);
      window.localStorage.setItem(stockStorageKeyM, nextStockM);
      renderStockValues({ stockS: nextStockS, stockM: nextStockM });
      return true;
    }

    window.alert("Unable to update shared stock right now. Please try again.");
    return false;
  }

  renderStockValues({
    stockS: normalizeStockValue(data.stock_s),
    stockM: normalizeStockValue(data.stock_m),
  });
  return true;
}

function updateTotal() {
  const { quantityS, quantityM } = getCookieQuantities();
  const cookiesTotal = quantityS * prices.S + quantityM * prices.M;
  const totalJars = quantityS + quantityM;
  const postageFee =
    orderMethodSelect.value === "Postage" ? getPostageFee(totalJars) : 0;
  const grandTotal = cookiesTotal + postageFee;

  summaryNote.textContent =
    postageFee > 0
      ? `Includes RM${postageFee} postage`
      : "Cookies total only";
  totalDisplay.textContent = `RM${grandTotal}`;
}

function updatePostageFields() {
  const isPostage = orderMethodSelect.value === "Postage";
  const isSelfCollect = orderMethodSelect.value === "Self collect";
  const isDeliveryRunner = orderMethodSelect.value === "Lalamove/Grab";
  const needsAddress = isPostage || isDeliveryRunner;
  postageFields.classList.toggle("hidden", !needsAddress);
  pickupGuide.classList.toggle("hidden", !isSelfCollect);
  postageGuide.classList.toggle("hidden", !isPostage);
  deliveryGuide.classList.toggle("hidden", !isDeliveryRunner);
  updateTotal();
}

function buildOrderMessage() {
  const { quantityS, quantityM } = getCookieQuantities();
  const totalJars = quantityS + quantityM;
  const cookiesTotal = quantityS * prices.S + quantityM * prices.M;
  const customerName = customerNameInput.value.trim() || "-";
  const customerPhone = customerPhoneInput.value.trim() || "-";
  const notes = orderNotesInput.value.trim() || "-";
  const orderMethod = orderMethodSelect.value;
  const postageFee = orderMethod === "Postage" ? getPostageFee(totalJars) : 0;
  const total = cookiesTotal + postageFee;
  const needsAddress =
    orderMethod === "Postage" || orderMethod === "Lalamove/Grab";

  const lines = [
    "Hello, I would like to place an order.",
    "",
    "Product: Sea Salt Callebaut Cookies",
    `Size S (27 pcs++): ${quantityS} x RM${prices.S}`,
    `Size M (40 pcs++): ${quantityM} x RM${prices.M}`,
    `Cookies subtotal: RM${cookiesTotal}`,
    `Postage fee: RM${postageFee}`,
    `Estimated total: RM${total}`,
    "",
    "Customer Details",
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Order method: ${orderMethod}`,
  ];

  if (needsAddress) {
    lines.push("");
    lines.push("Delivery Details");
    lines.push(`Receiver name: ${receiverNameInput.value.trim() || "-"}`);
    lines.push(`Receiver phone: ${receiverPhoneInput.value.trim() || "-"}`);
    lines.push(`Street 1: ${street1Input.value.trim() || "-"}`);
    lines.push(`Street 2: ${street2Input.value.trim() || "-"}`);
    lines.push(`City: ${cityInput.value.trim() || "-"}`);
    lines.push(`Postcode: ${postcodeInput.value.trim() || "-"}`);
    lines.push(`State: ${stateInput.value.trim() || "-"}`);
  }

  lines.push("");
  lines.push(`Notes: ${notes}`);

  return lines.join("\n");
}

function buildOrderWhatsAppLink() {
  const message = buildOrderMessage();
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

function updateOrderLink() {
  sendOrderButton.href = buildOrderWhatsAppLink();
}

function updateReceiptLink() {
  const message = `${buildOrderMessage()}\n\nI have completed the payment and attached the receipt.`;
  const encodedMessage = encodeURIComponent(message);
  sendReceiptButton.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

function openSettingsPanel() {
  settingsPanel.hidden = false;
  settingsPanel.classList.remove("hidden");
  document.body.classList.add("modal-open");
  settingsPasswordInput.value = "";
  settingsError.textContent = "Incorrect password.";
  settingsError.classList.add("hidden");
  settingsSuccess.classList.add("hidden");
  settingsLoginView.classList.remove("hidden");
  settingsEditorView.classList.add("hidden");
  settingsPasswordInput.focus();
}

function closeSettingsPanel() {
  settingsPanel.hidden = true;
  settingsPanel.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function unlockSettings() {
  const enteredPassword = settingsPasswordInput.value.trim();

  if (!enteredPassword) {
    settingsError.textContent = "Incorrect password.";
    settingsError.classList.remove("hidden");
    settingsSuccess.classList.add("hidden");
    return;
  }

  if (!supabaseClient) {
    if (enteredPassword !== fallbackSettingsPassword) {
      settingsError.textContent = "Incorrect password.";
      settingsError.classList.remove("hidden");
      settingsSuccess.classList.add("hidden");
      return;
    }

    activeAdminPassword = enteredPassword;
  } else {
    const { data, error } = await supabaseClient.rpc("verify_admin_password", {
      admin_password: enteredPassword,
    });

    if (error || data !== true) {
      if (canUseLocalFallback(error) && enteredPassword === fallbackSettingsPassword) {
        activeAdminPassword = enteredPassword;
        settingsSuccess.textContent = "Using local stock until Supabase setup is completed.";
        settingsSuccess.classList.remove("hidden");
      } else {
        settingsError.textContent = "Incorrect password.";
        settingsError.classList.remove("hidden");
        settingsSuccess.classList.add("hidden");
        return;
      }
    } else {
      activeAdminPassword = enteredPassword;
    }
  }

  settingsError.classList.add("hidden");
  settingsLoginView.classList.add("hidden");
  settingsEditorView.classList.remove("hidden");

  try {
    const { stockS, stockM } = await getStoredStock();
    stockInputS.value = stockS;
    stockInputM.value = stockM;
  } catch (error) {
    console.error("Unable to load stock for settings:", error);
    const { stockS, stockM } = getLocalStoredStock();
    stockInputS.value = stockS;
    stockInputM.value = stockM;
  }

  stockInputS.focus();
}

async function saveStock() {
  const stockS = normalizeStockValue(stockInputS.value);
  const stockM = normalizeStockValue(stockInputM.value);
  stockInputS.value = stockS;
  stockInputM.value = stockM;

  if (!supabaseClient) {
    window.localStorage.setItem(stockStorageKeyS, stockS);
    window.localStorage.setItem(stockStorageKeyM, stockM);
    renderStockValues({ stockS, stockM });
  } else {
    const { data, error } = await supabaseClient.rpc("admin_set_stock", {
      admin_password: activeAdminPassword || settingsPasswordInput.value.trim(),
      new_stock_s: stockS,
      new_stock_m: stockM,
    });

    if (error || !data) {
      console.error("Unable to save shared stock:", error);
      if (canUseLocalFallback(error)) {
        window.localStorage.setItem(stockStorageKeyS, stockS);
        window.localStorage.setItem(stockStorageKeyM, stockM);
        renderStockValues({ stockS, stockM });
        settingsSuccess.textContent = "Saved locally until Supabase setup is completed.";
      } else {
        settingsError.textContent = "Unable to save shared stock.";
        settingsError.classList.remove("hidden");
        settingsSuccess.classList.add("hidden");
        return;
      }
    } else {
      renderStockValues({
        stockS: normalizeStockValue(data.stock_s),
        stockM: normalizeStockValue(data.stock_m),
      });
      settingsSuccess.textContent = "Stock updated.";
    }
  }

  resetOrderReservationStatus();
  settingsError.textContent = "Incorrect password.";
  settingsError.classList.add("hidden");
  settingsSuccess.classList.remove("hidden");
}

quantitySInput.addEventListener("input", updateTotal);
quantityMInput.addEventListener("input", updateTotal);
orderMethodSelect.addEventListener("change", updatePostageFields);
quantitySInput.addEventListener("input", updateOrderLink);
quantityMInput.addEventListener("input", updateOrderLink);
orderMethodSelect.addEventListener("change", updateOrderLink);
customerNameInput.addEventListener("input", updateOrderLink);
customerPhoneInput.addEventListener("input", updateOrderLink);
receiverNameInput.addEventListener("input", updateOrderLink);
receiverPhoneInput.addEventListener("input", updateOrderLink);
street1Input.addEventListener("input", updateOrderLink);
street2Input.addEventListener("input", updateOrderLink);
cityInput.addEventListener("input", updateOrderLink);
postcodeInput.addEventListener("input", updateOrderLink);
stateInput.addEventListener("input", updateOrderLink);
orderNotesInput.addEventListener("input", updateOrderLink);
quantitySInput.addEventListener("input", updateReceiptLink);
quantityMInput.addEventListener("input", updateReceiptLink);
orderMethodSelect.addEventListener("change", updateReceiptLink);
customerNameInput.addEventListener("input", updateReceiptLink);
customerPhoneInput.addEventListener("input", updateReceiptLink);
receiverNameInput.addEventListener("input", updateReceiptLink);
receiverPhoneInput.addEventListener("input", updateReceiptLink);
street1Input.addEventListener("input", updateReceiptLink);
street2Input.addEventListener("input", updateReceiptLink);
cityInput.addEventListener("input", updateReceiptLink);
postcodeInput.addEventListener("input", updateReceiptLink);
stateInput.addEventListener("input", updateReceiptLink);
orderNotesInput.addEventListener("input", updateReceiptLink);
orderFormFields.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", resetOrderReservationStatus);
  field.addEventListener("change", resetOrderReservationStatus);
});
sendOrderButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const whatsappLink = sendOrderButton.href;

  if (!(await reserveStockForCurrentOrder())) {
    return;
  }

  window.location.assign(whatsappLink);
});
sendReceiptButton.addEventListener("click", async (event) => {
  if (!(await reserveStockForCurrentOrder())) {
    event.preventDefault();
  }
});
openSettingsButton.addEventListener("click", openSettingsPanel);
closeSettingsButton.addEventListener("click", closeSettingsPanel);
settingsBackdrop.addEventListener("click", closeSettingsPanel);
unlockSettingsButton.addEventListener("click", () => {
  unlockSettings();
});
saveStockButton.addEventListener("click", () => {
  saveStock();
});
settingsPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockSettings();
  }
});
stockInputS.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveStock();
  }
});
stockInputM.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveStock();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsPanel.hidden) {
    closeSettingsPanel();
  }
});

updateTotal();
updatePostageFields();
updateOrderLink();
updateReceiptLink();
renderStock();
