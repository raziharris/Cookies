const quantitySInput = document.querySelector("#quantity-s");
const quantityMInput = document.querySelector("#quantity-m");
const orderMethodSelect = document.querySelector("#order-method");
const postageFields = document.querySelector("#postage-fields");
const totalDisplay = document.querySelector("#total-display");
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
const sendOrderButton = document.querySelector("#send-order-button");
const sendReceiptButton = document.querySelector("#send-receipt-button");

const whatsappNumber = "60132283772";

const prices = {
  S: 25,
  M: 36,
};

function normalizeQuantity(input, fallback = 0) {
  const value = Math.min(1000, Math.max(0, Number(input.value) || fallback));
  input.value = value;
  return value;
}

function updateTotal() {
  const quantityS = normalizeQuantity(quantitySInput, 0);
  const quantityM = normalizeQuantity(quantityMInput, 0);
  const total = quantityS * prices.S + quantityM * prices.M;
  totalDisplay.textContent = `RM${total}`;
}

function updatePostageFields() {
  const needsAddress =
    orderMethodSelect.value === "Postage" ||
    orderMethodSelect.value === "Lalamove/Grab";
  postageFields.classList.toggle("hidden", !needsAddress);
}

function buildOrderMessage() {
  const quantityS = normalizeQuantity(quantitySInput, 0);
  const quantityM = normalizeQuantity(quantityMInput, 0);
  const total = quantityS * prices.S + quantityM * prices.M;
  const customerName = customerNameInput.value.trim() || "-";
  const customerPhone = customerPhoneInput.value.trim() || "-";
  const notes = orderNotesInput.value.trim() || "-";
  const orderMethod = orderMethodSelect.value;
  const needsAddress =
    orderMethod === "Postage" || orderMethod === "Lalamove/Grab";

  const lines = [
    "Hello, I would like to place an order.",
    "",
    "Product: Sea Salt Callebaut Cookies",
    `Size S (27 pcs++): ${quantityS} x RM${prices.S}`,
    `Size M (40 pcs++): ${quantityM} x RM${prices.M}`,
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
  const message = buildOrderMessage();
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
}

function updateReceiptLink() {
  const message = `${buildOrderMessage()}\n\nI have completed the payment and attached the receipt.`;
  const encodedMessage = encodeURIComponent(message);
  sendReceiptButton.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
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
sendOrderButton.addEventListener("click", openWhatsAppWithOrder);

updateTotal();
updatePostageFields();
updateReceiptLink();
