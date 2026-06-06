/* staff.js - kitchen board and payment verification */
function renderDashboard() {
    const cols = { received: [], preparing: [], ready: [] };
    S.orders.forEach(o => { if (cols[o.status]) cols[o.status].push(o); });
    const ready = S.orders.filter(o => o.status === "ready").length;
    return '<section class="view">' + staffSubnav('dashboard') + '<span class="eyebrow">Kitchen Dashboard</span><h1 class="title">Cook station</h1>' +
        '<p class="sub">Live tickets from students. Advance each order as you cook, and upload today\'s meals.</p>' +
        '<div class="grid-3" style="margin-bottom:18px">' +
        '<div class="card stat locked-stat"><div class="n">' + fmt(salesTotal()) + '</div><div class="l">Sales today</div></div>' +
        '<div class="card stat"><div class="n">' + S.orders.filter(o => o.status !== 'collected').length + '</div><div class="l">Active tickets</div></div>' +
        '<div class="card stat"><div class="n">' + ready + '</div><div class="l">Ready for pickup</div></div></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px"><button class="btn sm" onclick="mealForm(\'\')">+ Upload today\'s meal</button>' +
        '<button class="btn sm ghost" onclick="nav(\'paymentVerification\')">Verify payments</button></div>' +
        renderSuggestionApprovals() +
        '<div class="board">' + ["received", "preparing", "ready"].map(st => '<div class="col"><h3>' + STATUS_LBL[st] + ' <span class="count">' + cols[st].length + '</span></h3>' +
            (cols[st].length ? cols[st].map(o => kCard(o, st)).join("") : '<div class="empty" style="padding:24px"><div class="em">No tickets</div></div>') + '</div>').join("") + '</div></section>';
}

function renderSuggestionApprovals() {
    const pending = S.suggestions || [];
    if (!pending.length) {
        return '<div class="card" style="padding:18px;margin-bottom:18px"><b>Weekly suggestions</b><div style="color:var(--ink-soft);font-size:.9rem;margin-top:4px">No pending meal suggestions.</div></div>';
    }
    return '<div class="card" style="padding:18px;margin-bottom:18px"><b>Weekly meal suggestions to approve</b>' +
        pending.map(s => '<div class="line-item"><div style="flex:1"><b>' + s.name + '</b><div style="color:var(--ink-soft);font-size:.85rem">' + (s.description || 'No description') + ' - ' + s.week + '</div></div>' +
            '<button class="btn sm green" onclick="reviewSuggestion(\'' + s.id + '\',\'APPROVED\')">Can cook</button>' +
            '<button class="btn sm ghost" onclick="reviewSuggestion(\'' + s.id + '\',\'REJECTED\')">Reject</button></div>').join("") + '</div>';
}

function kCard(o, st) {
    const next = st === "received" ? "preparing" : st === "preparing" ? "ready" : null;
    const label = st === "received" ? "Start cooking" : st === "preparing" ? "Mark ready" : "";
    const mins = Math.floor((Date.now() - o.time) / 60000);
    return '<div class="kcard"><div style="display:flex;justify-content:space-between;align-items:center"><span class="kid">' + o.id + '</span><small style="color:var(--ink-faint)">' + mins + 'm ago</small></div>' +
        '<div style="font-size:.82rem;color:var(--ink-soft)">' + o.customer + ' - ' + o.method + (o.paid ? '' : ' - <b style="color:var(--chili)">UNVERIFIED</b>') + '</div>' +
        '<ul>' + o.items.map(i => '<li><span>' + i.name + '</span><b>x' + i.qty + '</b></li>').join("") + '</ul>' +
        (next ? '<button class="btn sm ' + (st === 'preparing' ? 'green' : 'dark') + '" style="width:100%" ' + (!o.paid ? 'disabled title="Verify payment first"' : '') + ' onclick="advance(\'' + o.id + '\')">' + label + '</button>' : '<div style="text-align:center;color:var(--herb);font-weight:800">Ready for pickup</div>') + '</div>';
}

async function advance(id) {
    const o = S.orders.find(x => x.id === id);
    if (!o) return;
    try {
        await apiJson("/api/orders/" + id + "/status", "PUT", { status: orderStatusToApi(o.status) }, true);
        await syncFromApi();
        save();
        mount();
        const updated = S.orders.find(x => x.id === id);
        if (updated && updated.status === "ready") toast("Order ready", updated.customer + " can collect " + updated.id, "chili");
    } catch (e) {
        toast("Update failed", e.message, "chili");
    }
}

function renderPaymentVerification() {
    const pending = S.orders.filter(o => o.paymentId && o.paymentStatus === "PENDING");
    return '<section class="view">' + staffSubnav('paymentVerification') + '<span class="eyebrow">Kitchen</span><h1 class="title">Payment verification</h1>' +
        '<p class="sub">Confirm Mobile Money payments before the order is released to the kitchen.</p>' +
        (pending.length ? '<div class="card" style="padding:8px 22px 18px">' + pending.map(o => '<div class="line-item"><div style="flex:1"><b class="money">' + o.id + '</b> - ' + o.customer + '<div style="color:var(--ink-soft);font-size:.85rem">' + o.method + ' - <span class="money">' + fmt(o.total) + '</span></div></div><button class="btn sm green" onclick="verifyPay(\'' + o.paymentId + '\')">Verify</button></div>').join("") + '</div>' :
            '<div class="empty"><div class="em">All payments verified.</div></div>') + '</section>';
}

async function verifyPay(paymentId) {
    try {
        await apiJson("/api/payments/" + paymentId + "/verify", "PUT", { status: "VERIFIED" }, true);
        await syncFromApi();
        save();
        mount();
        toast("Payment verified", "Order released to kitchen");
    } catch (e) {
        toast("Verification failed", e.message, "chili");
    }
}

async function reviewSuggestion(id, status) {
    try {
        await apiJson("/api/votes/suggestions/" + id + "/review", "PUT", { status }, true);
        await syncFromApi();
        save();
        mount();
        toast("Suggestion reviewed", status === "APPROVED" ? "Marked as cookable" : "Suggestion rejected");
    } catch (e) {
        toast("Review failed", e.message, "chili");
    }
}
