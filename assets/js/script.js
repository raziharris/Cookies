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
const settingsPassword = "cuzicunim";
const stockStorageKeyS = "chubbychubakes_stock_left_s";
const stockStorageKeyM = "chubbychubakes_stock_left_m";
const stockAppliedSessionKey = "chubbychubakes_stock_applied";

const prices = {
  S: 25,
  M: 36,
};

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

function getStoredStock() {
  return {
    stockS: normalizeStockValue(window.localStorage.getItem(stockStorageKeyS)),
    stockM: normalizeStockValue(window.localStorage.getItem(stockStorageKeyM)),
  };
}

function renderStock() {
  const { stockS, stockM } = getStoredStock();
  stockLeftDisplayS.textContent = `Size S: ${stockS} jars`;
  stockLeftDisplayM.textContent = `Size M: ${stockM} jars`;
}

function resetStockReservationStatus() {
  window.sessionStorage.removeItem(stockAppliedSessionKey);
}

function reserveStockForCurrentOrder() {
  if (window.sessionStorage.getItem(stockAppliedSessionKey) === "true") {
    return;
  }

  const { quantityS, quantityM } = getCookieQuantities();

  if (quantityS <= 0 && quantityM <= 0) {
    return;
  }

  const { stockS, stockM } = getStoredStock();
  const nextStockS = Math.max(0, stockS - quantityS);
  const nextStockM = Math.max(0, stockM - quantityM);

  window.localStorage.setItem(stockStorageKeyS, nextStockS);
  window.localStorage.setItem(stockStorageKeyM, nextStockM);
  window.sessionStorage.setItem(stockAppliedSessionKey, "true");
  renderStock();
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

function openWhatsAppWithOrder() {
  updateTotal();
  reserveStockForCurrentOrder();
  const message = buildOrderMessage();
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
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

function unlockSettings() {
  if (settingsPasswordInput.value !== settingsPassword) {
    settingsError.classList.remove("hidden");
    settingsSuccess.classList.add("hidden");
    return;
  }

  settingsError.classList.add("hidden");
  settingsLoginView.classList.add("hidden");
  settingsEditorView.classList.remove("hidden");
  const { stockS, stockM } = getStoredStock();
  stockInputS.value = stockS;
  stockInputM.value = stockM;
  stockInputS.focus();
}

function saveStock() {
  const stockS = normalizeStockValue(stockInputS.value);
  const stockM = normalizeStockValue(stockInputM.value);
  stockInputS.value = stockS;
  stockInputM.value = stockM;
  window.localStorage.setItem(stockStorageKeyS, stockS);
  window.localStorage.setItem(stockStorageKeyM, stockM);
  resetStockReservationStatus();
  renderStock();
  settingsSuccess.classList.remove("hidden");
}

quantitySInput.addEventListener("input", updateTotal);
quantityMInput.addEventListener("input", updateTotal);
orderMethodSelect.addEventListener("change", updatePostageFields);
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
  field.addEventListener("input", resetStockReservationStatus);
  field.addEventListener("change", resetStockReservationStatus);
});
sendOrderButton.addEventListener("click", openWhatsAppWithOrder);
sendReceiptButton.addEventListener("click", reserveStockForCurrentOrder);
openSettingsButton.addEventListener("click", openSettingsPanel);
closeSettingsButton.addEventListener("click", closeSettingsPanel);
settingsBackdrop.addEventListener("click", closeSettingsPanel);
unlockSettingsButton.addEventListener("click", unlockSettings);
saveStockButton.addEventListener("click", saveStock);
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
updateReceiptLink();
renderStock();
