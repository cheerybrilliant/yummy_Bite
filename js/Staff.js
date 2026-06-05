/* staff.js — cook login, order board, payment verification */

function renderDashboard() {
    const cols = { received: [], preparing: [], ready: [] };
    S.orders.forEach(o => { if (cols[o.status]) cols[o.status].push(o) });
    const ready = S.orders.filter(o => o.status === "ready").length;
    return '<section class="view">' + staffSubnav('dashboard') + '<span class="eyebrow">Kitchen Dashboard</span><h1 class="title">Cook station</h1>' +
        '<p class="sub">Live tickets from students. Advance each order as you cook, and upload today’s meals.</p>' +
        '<div class="grid-3" style="margin-bottom:18px">' +
        '<div class="card stat locked-stat"><div class="n">' + fmt(salesTotal()) + '</div><div class="l">💰 Sales today (staff only)</div></div>' +
        '<div class="card stat"><div class="n">' + S.orders.filter(o => o.status !== 'collected').length + '</div><div class="l">Active tickets</div></div>' +
        '<div class="card stat"><div class="n">' + ready + '</div><div class="l">Ready for pickup</div></div></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px"><button class="btn sm" onclick="mealForm(\'\')">+ Upload today’s meal</button>' +
        '<button class="btn sm ghost" onclick="nav(\'paymentVerification\')">Verify payments →</button></div>' +
        '<div class="board">' + ["received", "preparing", "ready"].map(st => '<div class="col"><h3>' + STATUS_LBL[st] + ' <span class="count">' + cols[st].length + '</span></h3>' +
            (cols[st].length ? cols[st].map(o => kCard(o, st)).join("") : '<div class="empty" style="padding:24px"><div class="em">🍳</div><small>No tickets</small></div>') + '</div>').join("") + '</div></section>';
}

function kCard(o, st) {
    const next = st === "received" ? "preparing" : st === "preparing" ? "ready" : null;
    const label = st === "received" ? "Start cooking" : st === "preparing" ? "Mark Ready" : "";
    const mins = Math.floor((Date.now() - o.time) / 60000);
    return '<div class="kcard"><div style="display:flex;justify-content:space-between;align-items:center"><span class="kid">' + o.id + '</span><small style="color:var(--ink-faint)">' + mins + 'm ago</small></div>' +
        '<div style="font-size:.82rem;color:var(--ink-soft)">' + o.customer + ' · ' + o.method + (o.paid ? '' : ' · <b style="color:var(--chili)">UNPAID</b>') + '</div>' +
        '<ul>' + o.items.map(i => '<li><span>' + i.name + '</span><b>×' + i.qty + '</b></li>').join("") + '</ul>' +
        (next ? '<button class="btn sm ' + (st === 'preparing' ? 'green' : 'dark') + '" style="width:100%" ' + (!o.paid ? 'disabled title="Verify payment first"' : '') + ' onclick="advance(\'' + o.id + '\')">' + label + ' →</button>' : '<div style="text-align:center;color:var(--herb);font-weight:800">✓ Ready for pickup</div>') + '</div>';
}

function advance(id) { const o = S.orders.find(x => x.id === id);
    o.status = STATUS[STATUS.indexOf(o.status) + 1];
    save();
    mount(); if (o.status === "ready") toast("Order ready 🔔", o.customer + ' notified — ' + o.id + ' ready for pickup', "chili"); }

function renderPaymentVerification() {
    const pending = S.orders.filter(o => !o.paid);
    return '<section class="view">' + staffSubnav('paymentVerification') + '<span class="eyebrow">Kitchen</span><h1 class="title">Payment verification</h1>' +
        '<p class="sub">Confirm Mobile Money payments before the order is released to the kitchen.</p>' +
        (pending.length ? '<div class="card" style="padding:8px 22px 18px">' + pending.map(o => '<div class="line-item"><div style="flex:1"><b class="money">' + o.id + '</b> · ' + o.customer + '<div style="color:var(--ink-soft);font-size:.85rem">' + o.method + ' · <span class="money">' + fmt(o.total) + '</span></div></div><button class="btn sm green" onclick="verifyPay(\'' + o.id + '\')">Verify ✓</button></div>').join("") + '</div>' :
            '<div class="empty"><div class="em">✅</div>All payments verified.</div>') + '</section>';
}

function verifyPay(id) { S.orders.find(o => o.id === id).paid = true;
    save();
    mount();
    toast("Payment verified", "Order released to kitchen ✓"); }