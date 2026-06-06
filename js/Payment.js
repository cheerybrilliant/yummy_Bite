/* payment.js - manual Mobile Money proof flow */
function pendingPaymentOrder() {
    return S.orders.find(o => o.id === S.pendingPaymentOrder) ||
        S.orders.find(o => o.id === S.activeOrder && (o.apiStatus === "PENDING_PAYMENT" || o.paymentStatus === "REJECTED"));
}

function renderPayment() {
    const order = pendingPaymentOrder();
    if (!Object.keys(S.cart).length && !order) { location.href = PATHS.menu; return ''; }
    if (order) return renderProofUpload(order);

    const total = cartTotal();
    return '<section class="view">' + studentSubnav('') + '<button class="chip" onclick="nav(\'cart\')">Back to cart</button>' +
        '<span class="eyebrow" style="display:block;margin-top:14px">Manual Mobile Money payment</span><h1 class="title">Generate your Order ID</h1>' +
        '<p class="sub">First create the order. Then send exactly the shown amount to the canteen MoMo number from your own phone and upload proof.</p>' +
        '<div class="grid-2" style="align-items:start;margin-top:10px"><div class="card" style="padding:24px">' +
        '<h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Order summary</h3>' +
        Object.entries(S.cart).map(([id, q]) => { const m = S.menu.find(x => x.id === id); return '<div class="summary"><span>' + q + ' x ' + m.name + '</span><span class="money">' + fmt(m.price * q) + '</span></div>' }).join("") +
        '<div class="summary total"><span>Amount to pay</span><span class="money">' + fmt(total) + '</span></div>' +
        '<button class="btn green" style="width:100%;margin-top:18px" onclick="generateOrderForPayment()">Generate Order ID</button></div>' +
        '<div class="card" style="padding:24px;position:sticky;top:90px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:10px">Canteen MoMo number</h3>' +
        '<div class="oid" style="font-size:1.6rem">' + CANTEEN_MOMO_NUMBER + '</div>' +
        '<p style="font-size:.88rem;color:var(--ink-soft);margin-top:10px">Do not pay yet if you have not generated an Order ID.</p></div></div></section>';
}

function renderProofUpload(order) {
    const rejected = order.paymentStatus === "REJECTED";
    return '<section class="view">' + studentSubnav('') + '<button class="chip" onclick="nav(\'tracking\')">Back to tracking</button>' +
        '<span class="eyebrow" style="display:block;margin-top:14px">Manual Mobile Money payment</span><h1 class="title">Upload payment proof</h1>' +
        '<p class="sub">Send the money manually from your MTN MoMo app or USSD, then upload the confirmation screenshot and transaction ID.</p>' +
        (rejected ? '<div class="card" style="padding:14px 18px;margin-bottom:16px;border-color:var(--chili)"><b>Payment rejected</b><div style="color:var(--ink-soft);margin-top:4px">' + (order.rejectedReason || 'Please upload clearer proof.') + '</div></div>' : '') +
        '<div class="grid-2" style="align-items:start;margin-top:10px"><div class="card" style="padding:24px">' +
        '<h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Pay this order</h3>' +
        '<div class="summary"><span>Order ID</span><span class="money">' + order.id + '</span></div>' +
        '<div class="summary"><span>Canteen MoMo number</span><span class="money">' + CANTEEN_MOMO_NUMBER + '</span></div>' +
        '<div class="summary total"><span>Amount</span><span class="money">' + fmt(order.total) + '</span></div>' +
        '<div class="field" style="margin-top:14px"><label>Transaction ID from MoMo confirmation</label><input id="txid" placeholder="e.g. 1234567890"></div>' +
        '<div class="field" style="margin-top:14px"><label>MoMo confirmation screenshot</label><input id="proof" type="file" accept="image/*"></div>' +
        '<button class="btn green" style="width:100%;margin-top:18px" onclick="submitPaymentProof(\'' + order.id + '\')">' + (rejected ? 'Re-upload proof' : 'Submit proof') + '</button></div>' +
        '<div class="card" style="padding:24px;position:sticky;top:90px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:10px">What staff checks</h3>' +
        '<div class="summary"><span>Amount matches</span><span>' + fmt(order.total) + '</span></div>' +
        '<div class="summary"><span>Transaction ID entered</span><span>Required</span></div>' +
        '<div class="summary"><span>Screenshot looks real</span><span>Required</span></div></div></div></section>';
}

async function generateOrderForPayment() {
    const items = Object.entries(S.cart).map(([id, q]) => ({ dishId: id, quantity: q }));
    if (!items.length) { toast("Cart empty", "Add food before generating an order", "chili"); return; }
    try {
        const placed = await apiJson("/api/orders", "POST", { items }, true);
        S.activeOrder = placed.orderId;
        S.pendingPaymentOrder = placed.orderId;
        S.cart = {};
        await syncFromApi();
        save();
        mount();
        toast("Order ID generated", "Now send MoMo payment and upload proof.");
    } catch (e) {
        toast("Order failed", e.message, "chili");
    }
}

async function submitPaymentProof(orderId) {
    const transactionId = (document.getElementById("txid").value || "").trim();
    const file = document.getElementById("proof").files[0];
    if (!transactionId) { toast("Transaction ID required", "Type the ID from your MoMo confirmation", "chili"); return; }
    if (!file) { toast("Screenshot required", "Upload the MoMo confirmation screenshot", "chili"); return; }
    const form = new FormData();
    form.append("orderId", orderId);
    form.append("transactionId", transactionId);
    form.append("screenshot", file);
    try {
        await api("/api/payments", { method: "POST", headers: authHeaders(), body: form });
        S.pendingPaymentOrder = "";
        S.activeOrder = orderId;
        await syncFromApi();
        save();
        toast("Proof submitted", "Staff will verify your payment.");
        nav('tracking');
    } catch (e) {
        toast("Upload failed", e.message, "chili");
    }
}
