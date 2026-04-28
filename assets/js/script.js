const sizeSelect = document.querySelector("#size-select");
const quantityInput = document.querySelector("#quantity-input");
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

function updateTotal() {
  const size = sizeSelect.value;
  const quantity = Math.min(1000, Math.max(1, Number(quantityInput.value) || 1));
  const unitPrice = prices[size];
  const total = unitPrice * quantity;
  quantityInput.value = quantity;
  totalDisplay.textContent = `RM${total}`;
}

function updatePostageFields() {
  const needsAddress =
    orderMethodSelect.value === "Postage" ||
    orderMethodSelect.value === "Lalamove/Grab";
  postageFields.classList.toggle("hidden", !needsAddress);
}

function buildOrderMessage() {
  const size = sizeSelect.value;
  const quantity = Math.min(1000, Math.max(1, Number(quantityInput.value) || 1));
  const unitPrice = prices[size];
  const total = unitPrice * quantity;
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
    `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Price per unit: RM${unitPrice}`,
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

sizeSelect.addEventListener("change", updateTotal);
quantityInput.addEventListener("input", updateTotal);
orderMethodSelect.addEventListener("change", updatePostageFields);
sizeSelect.addEventListener("change", updateReceiptLink);
quantityInput.addEventListener("input", updateReceiptLink);
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
