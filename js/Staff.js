/* Staff dashboard and payment verification behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("staffDashboardPage")) loadStaffDashboard();
    if (document.getElementById("paymentVerificationPage")) loadPaymentVerification();
});

async function staffOrders() {
    return App.api("/api/orders", { headers: App.authHeaders() });
}

async function loadStaffDashboard() {
    if (!App.requireAnyRole(["STAFF", "ADMIN"])) return;
    const orders = await staffOrders();
    document.getElementById("activeTicketCount").textContent = orders.filter(order => order.status !== "COMPLETED").length;
    document.getElementById("readyTicketCount").textContent = orders.filter(order => order.status === "READY_FOR_COLLECTION").length;
    drawOrderColumn("confirmedOrders", orders.filter(order => order.status === "PAYMENT_CONFIRMED"), "Start cooking", "PREPARING");
    drawOrderColumn("preparingOrders", orders.filter(order => order.status === "PREPARING"), "Mark ready", "READY_FOR_COLLECTION");
    drawOrderColumn("readyOrders", orders.filter(order => order.status === "READY_FOR_COLLECTION"), "Waiting for student", "");
    await loadSuggestionApprovals();
}

function drawOrderColumn(id, orders, label, nextStatus) {
    const target = document.getElementById(id);
    target.innerHTML = "";
    if (!orders.length) {
        target.innerHTML = "<li class='empty-list'>No tickets</li>";
        return;
    }
    orders.forEach(order => {
        const item = document.createElement("li");
        item.className = "ticket-card";
        item.innerHTML = "<strong>" + App.escape(order.id) + "</strong><span>" + App.escape(order.student.name) + "</span><small>" + order.items.map(row => row.quantity + " x " + App.escape(row.dish.name)).join(", ") + "</small>";
        if (nextStatus) {
            const button = document.createElement("button");
            button.className = "btn sm";
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => updateKitchenStatus(order.id, nextStatus));
            item.appendChild(button);
        }
        target.appendChild(item);
    });
}

async function updateKitchenStatus(orderId, status) {
    try {
        await App.apiJson("/api/orders/" + orderId + "/status", "PUT", { status }, true);
        App.notice("Order updated", App.statusText(status));
        await loadStaffDashboard();
    } catch (error) {
        App.notice("Update failed", error.message, "error");
    }
}

async function loadSuggestionApprovals() {
    const body = document.getElementById("suggestionsTableBody");
    if (!body) return;
    const result = await App.api("/api/votes/suggestions?status=PENDING", { headers: App.authHeaders() });
    body.innerHTML = "";
    (result.suggestions || []).forEach(suggestion => {
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + App.escape(suggestion.name) + "</td><td>" + App.escape(suggestion.description || "") + "</td><td>" + App.escape(suggestion.week) + "</td><td><button class='btn sm green' type='button'>Can cook</button> <button class='btn sm ghost' type='button'>Reject</button></td>";
        row.querySelector(".green").addEventListener("click", () => reviewSuggestion(suggestion.id, "APPROVED"));
        row.querySelector(".ghost").addEventListener("click", () => reviewSuggestion(suggestion.id, "REJECTED"));
        body.appendChild(row);
    });
}

async function reviewSuggestion(id, status) {
    try {
        await App.apiJson("/api/votes/suggestions/" + id + "/review", "PUT", { status }, true);
        App.notice("Suggestion reviewed", status === "APPROVED" ? "Marked as cookable" : "Rejected");
        await loadStaffDashboard();
    } catch (error) {
        App.notice("Review failed", error.message, "error");
    }
}

async function loadPaymentVerification() {
    if (!App.requireAnyRole(["STAFF", "ADMIN"])) return;
    const orders = await staffOrders();
    const pending = orders.filter(order => order.payment && order.payment.status === "PENDING");
    const body = document.getElementById("paymentVerificationBody");
    const empty = document.getElementById("paymentVerificationEmpty");
    body.innerHTML = "";
    empty.hidden = pending.length > 0;
    pending.forEach(order => {
        const proofUrl = order.payment.screenshot ? App.API_BASE + "/" + order.payment.screenshot.replaceAll("\\", "/") : "";
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + App.escape(order.id) + "</td><td>" + App.escape(order.student.name) + "</td><td>" + App.money(order.totalAmount) + "</td><td>" + App.escape(order.payment.transactionId) + "</td><td>" + (proofUrl ? "<a href='" + proofUrl + "' target='_blank'>Open screenshot</a>" : "No screenshot") + "</td><td><input class='reject-input' placeholder='Reason if rejected'></td><td><button class='btn sm green' type='button'>Confirm</button> <button class='btn sm ghost' type='button'>Reject</button></td>";
        row.querySelector(".green").addEventListener("click", () => verifyPayment(order.payment.id, "VERIFIED", ""));
        row.querySelector(".ghost").addEventListener("click", () => verifyPayment(order.payment.id, "REJECTED", row.querySelector("input").value.trim()));
        body.appendChild(row);
    });
}

async function verifyPayment(paymentId, status, rejectedReason) {
    if (status === "REJECTED" && !rejectedReason) return App.notice("Reason required", "Enter why the payment proof is rejected", "error");
    try {
        await App.apiJson("/api/payments/" + paymentId + "/verify", "PUT", { status, rejectedReason }, true);
        App.notice("Payment updated", status === "VERIFIED" ? "Order released to kitchen" : "Student can re-upload proof");
        await loadPaymentVerification();
    } catch (error) {
        App.notice("Payment update failed", error.message, "error");
    }
}
