/* Manual Mobile Money payment page behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("paymentPage")) initPaymentPage();
});

async function initPaymentPage() {
    if (!App.requireRole("STUDENT")) return;
    document.querySelectorAll("[data-momo-number]").forEach(el => { el.textContent = App.MOMO_NUMBER; });
    document.getElementById("generateOrderButton").addEventListener("click", generateOrderForPayment);
    document.getElementById("paymentProofForm").addEventListener("submit", submitPaymentProof);
    await renderPaymentSummary();
}

async function renderPaymentSummary() {
    const pendingId = App.pendingPayment();
    const cartItems = Object.values(App.cart());
    const summaryBody = document.getElementById("paymentSummaryBody");
    const amount = document.getElementById("paymentAmount");
    const orderId = document.getElementById("paymentOrderId");
    const proofSection = document.getElementById("paymentProofForm");
    const createSection = document.getElementById("createOrderSection");
    summaryBody.innerHTML = "";

    if (pendingId) {
        const order = await App.api("/api/orders/" + pendingId, { headers: App.authHeaders() });
        order.items.forEach(item => addSummaryRow(summaryBody, item.quantity + " x " + item.dish.name, item.price * item.quantity));
        orderId.value = order.id;
        amount.textContent = App.money(order.totalAmount);
        proofSection.hidden = false;
        createSection.hidden = true;
        return;
    }

    let total = 0;
    cartItems.forEach(item => {
        total += item.price * item.quantity;
        addSummaryRow(summaryBody, item.quantity + " x " + item.name, item.price * item.quantity);
    });
    amount.textContent = App.money(total);
    proofSection.hidden = true;
    createSection.hidden = !cartItems.length;
    document.getElementById("emptyPaymentCart").hidden = cartItems.length > 0;
}

function addSummaryRow(body, label, value) {
    const row = document.createElement("tr");
    row.innerHTML = "<td>" + App.escape(label) + "</td><td>" + App.money(value) + "</td>";
    body.appendChild(row);
}

async function generateOrderForPayment() {
    const items = Object.values(App.cart()).map(item => ({ dishId: item.id, quantity: item.quantity }));
    if (!items.length) return App.notice("Cart empty", "Add meals before payment", "error");
    try {
        const result = await App.apiJson("/api/orders", "POST", { items }, true);
        App.clearCart();
        App.setActiveOrder(result.orderId);
        App.setPendingPayment(result.orderId);
        App.notice("Order ID generated", "Now send MoMo payment and upload proof");
        await renderPaymentSummary();
    } catch (error) {
        App.notice("Order failed", error.message, "error");
    }
}

async function submitPaymentProof(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.orderId.value.trim();
    const transactionId = form.transactionId.value.trim();
    const screenshot = form.screenshot.files[0];
    if (!orderId || !transactionId || !screenshot) {
        App.notice("Missing proof", "Order ID, transaction ID and screenshot are required", "error");
        return;
    }
    const data = new FormData();
    data.append("orderId", orderId);
    data.append("transactionId", transactionId);
    data.append("screenshot", screenshot);
    try {
        await App.api("/api/payments", { method: "POST", headers: App.authHeaders(), body: data });
        App.setPendingPayment("");
        App.setActiveOrder(orderId);
        App.notice("Proof submitted", "Staff will verify your payment");
        App.nav("tracking");
    } catch (error) {
        App.notice("Upload failed", error.message, "error");
    }
}
