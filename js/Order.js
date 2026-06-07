/* Student order tracking, review and voting behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("trackingPage")) loadTrackingPage();
    if (document.getElementById("reviewPage")) loadReviewPage();
    if (document.getElementById("votingPage")) loadVotingPage();
});

async function loadTrackingPage() {
    if (!App.requireRole("STUDENT")) return;
    const orders = await studentOrders();
    const body = document.getElementById("ordersTableBody");
    const empty = document.getElementById("ordersEmpty");
    body.innerHTML = "";
    empty.hidden = orders.length > 0;
    orders.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + App.escape(order.id) + "</td><td>" + new Date(order.createdAt).toLocaleString() + "</td><td>" + App.money(order.totalAmount) + "</td><td>" + App.statusText(order.status) + "</td><td>" + App.paymentText(order.payment && order.payment.status) + "</td><td><button class='btn sm' type='button'>View</button></td>";
        row.querySelector("button").addEventListener("click", () => showOrderDetails(order));
        body.appendChild(row);
    });
    const active = App.activeOrder();
    showOrderDetails(orders.find(order => order.id === active) || orders[0]);
}

async function studentOrders() {
    const current = App.user();
    return App.api("/api/orders/student/" + current.id, { headers: App.authHeaders() });
}

function showOrderDetails(order) {
    const panel = document.getElementById("orderDetails");
    if (!panel || !order) return;
    App.setActiveOrder(order.id);
    document.getElementById("detailOrderId").textContent = order.id;
    document.getElementById("detailStatus").textContent = App.statusText(order.status);
    document.getElementById("detailDate").textContent = new Date(order.createdAt).toLocaleString();
    document.getElementById("detailAmount").textContent = App.money(order.totalAmount);
    document.getElementById("detailItems").innerHTML = order.items.map(item => "<li>" + item.quantity + " x " + App.escape(item.dish.name) + "</li>").join("");
    const logBody = document.getElementById("transactionLogBody");
    logBody.innerHTML = (order.logs || []).map(log => "<tr><td>" + App.escape(log.action.replaceAll("_", " ")) + "</td><td>" + App.escape(log.note || "") + "</td><td>" + new Date(log.createdAt).toLocaleString() + "</td></tr>").join("");
    const receive = document.getElementById("receiveOrderButton");
    const upload = document.getElementById("uploadProofButton");
    const review = document.getElementById("reviewOrderButton");
    receive.hidden = order.status !== "READY_FOR_COLLECTION";
    upload.hidden = !(order.status === "PENDING_PAYMENT" || (order.payment && order.payment.status === "REJECTED"));
    review.hidden = order.status !== "COMPLETED";
    receive.onclick = () => markReceived(order.id);
    upload.onclick = () => { App.setPendingPayment(order.id); App.nav("payment"); };
    review.onclick = () => { App.setActiveOrder(order.id); App.nav("review"); };
    panel.hidden = false;
}

async function markReceived(orderId) {
    try {
        await App.apiJson("/api/orders/" + orderId + "/status", "PUT", { status: "COMPLETED" }, true);
        App.notice("Order collected", "Receipt and transaction log created");
        await loadTrackingPage();
    } catch (error) {
        App.notice("Update failed", error.message, "error");
    }
}

async function loadReviewPage() {
    if (!App.requireRole("STUDENT")) return;
    const orders = (await studentOrders()).filter(order => order.status === "COMPLETED");
    const select = document.getElementById("reviewOrder");
    const dishSelect = document.getElementById("reviewDish");
    const form = document.getElementById("reviewForm");
    select.innerHTML = "";
    orders.forEach(order => {
        const option = document.createElement("option");
        option.value = order.id;
        option.textContent = order.id + " - " + new Date(order.createdAt).toLocaleDateString();
        option._order = order;
        select.appendChild(option);
    });
    function fillDishes() {
        const order = select.selectedOptions[0] && select.selectedOptions[0]._order;
        dishSelect.innerHTML = "";
        if (!order) return;
        order.items.forEach(item => {
            const option = document.createElement("option");
            option.value = item.dish.id;
            option.textContent = item.dish.name;
            dishSelect.appendChild(option);
        });
    }
    select.addEventListener("change", fillDishes);
    fillDishes();
    form.addEventListener("submit", submitReview);
}

async function submitReview(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
        await App.apiJson("/api/reviews", "POST", {
            orderId: form.orderId.value,
            dishId: form.dishId.value,
            rating: Number(form.rating.value),
            comment: form.comment.value.trim()
        }, true);
        App.notice("Review submitted", "Thank you for the feedback");
        App.nav("tracking");
    } catch (error) {
        App.notice("Review failed", error.message, "error");
    }
}

async function loadVotingPage() {
    if (!App.requireRole("STUDENT")) return;
    document.getElementById("suggestionForm").addEventListener("submit", submitSuggestion);
    document.getElementById("voteForm").addEventListener("submit", submitVote);
    const dishes = await App.api("/api/dishes");
    const list = document.getElementById("voteDishList");
    list.innerHTML = "";
    dishes.forEach(dish => {
        const label = document.createElement("label");
        label.className = "check-row";
        label.innerHTML = "<input type='checkbox' name='dishIds' value='" + App.escape(dish.id) + "'> <span>" + App.escape(dish.name) + "</span>";
        list.appendChild(label);
    });
}

async function submitSuggestion(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
        await App.apiJson("/api/votes/suggestions", "POST", { name: form.name.value.trim(), description: form.description.value.trim() }, true);
        form.reset();
        App.notice("Suggestion sent", "A cook will review if it can be prepared");
    } catch (error) {
        App.notice("Suggestion failed", error.message, "error");
    }
}

async function submitVote(event) {
    event.preventDefault();
    const dishIds = Array.from(event.currentTarget.querySelectorAll("input[name='dishIds']:checked")).map(input => input.value);
    try {
        await App.apiJson("/api/votes", "POST", { dishIds }, true);
        App.notice("Vote submitted", "Your weekly vote has been counted");
    } catch (error) {
        App.notice("Vote failed", error.message, "error");
    }
}
