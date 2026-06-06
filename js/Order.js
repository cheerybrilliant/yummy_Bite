/* order.js - confirmation, tracking, review and voting */

function renderConfirmation(isReceipt) {
    const o = S.orders.find(x => x.id === S.activeOrder) || S.orders[0];
    if (!o) return '<section class="view">' + studentSubnav('') + '<div class="empty"><div class="em">No order yet.</div><button class="btn" style="display:block;margin:14px auto 0" onclick="nav(\'menu\')">Order something</button></section>';
    return '<section class="view">' + studentSubnav('') + '<div class="ticket"><div class="ticket-in"><h2>ICTU Canteen</h2>' +
        '<p style="text-align:center;color:var(--ink-soft);font-size:.85rem">' + (isReceipt ? 'Receipt' : 'Order submitted') + '</p>' +
        '<div class="oid">' + o.id + '</div><div style="text-align:center;color:var(--herb);font-weight:800;margin-bottom:6px">' + (o.paid ? 'Payment verified' : 'Payment awaiting staff verification') + '</div><hr class="dash">' +
        o.items.map(i => '<div class="li"><span>' + i.qty + ' x ' + i.name + '</span><span>' + fmt(i.price * i.qty) + '</span></div>').join("") + '<hr class="dash">' +
        '<div class="li" style="font-weight:800;font-size:1rem"><span>TOTAL</span><span>' + fmt(o.total) + '</span></div>' +
        '<div style="text-align:center;color:var(--ink-faint);font-size:.78rem;margin-top:14px">' + new Date(o.time).toLocaleString('en-GB') + '</div></div></div>' +
        '<div style="display:flex;gap:10px;justify-content:center;margin-top:24px"><button class="btn dark" onclick="nav(\'tracking\')">Track my order</button><button class="btn ghost" onclick="nav(\'menu\')">Order more</button></div></section>';
}

function renderTracking() {
    const mine = S.orders.filter(o => (S.user && o.customer === S.user.name) || o.id === S.activeOrder);
    if (!mine.length) return '<section class="view">' + studentSubnav('tracking') + '<div class="empty"><div class="em">No orders yet.</div><button class="btn" style="display:block;margin:14px auto 0" onclick="nav(\'menu\')">Order something</button></div></section>';
    const o = S.orders.find(x => x.id === S.activeOrder) || mine[0];
    const idx = STATUS.indexOf(o.status);
    return '<section class="view">' + studentSubnav('tracking') + '<span class="eyebrow">Order ' + o.id + '</span>' +
        '<h1 class="title">' + (o.status === 'ready' ? 'Ready for pickup' : o.status === 'collected' ? 'Enjoyed?' : 'Cooking your food') + '</h1>' +
        '<p class="sub">' + (o.status === 'ready' ? 'Your order is ready. Show your Order ID at the counter.' : o.status === 'collected' ? 'Rate your meal so others know what to order.' : (o.paid ? 'The kitchen is working on your order.' : 'Your payment is waiting for staff verification.')) + '</p>' +
        '<div style="color:var(--ink-soft);font-weight:700;margin-bottom:12px">Ordered on ' + new Date(o.time).toLocaleString('en-GB') + '</div>' +
        '<div class="card" style="padding:26px"><div class="pipe">' + STATUS.map((s, i) => '<div class="step ' + (i < idx ? 'done' : '') + ' ' + (i === idx ? 'active' : '') + '"><div class="dotn">' + (i < idx ? 'OK' : i + 1) + '</div><div class="lbl">' + STATUS_LBL[s] + '</div></div>').join("") + '</div><hr class="dash">' +
        '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><div>' + o.items.map(i => '<div>' + i.qty + ' x ' + i.name + '</div>').join("") + '</div>' +
        '<div style="text-align:right"><div class="money" style="font-size:1.2rem;color:var(--chili-deep)">' + fmt(o.total) + '</div><div style="color:var(--ink-soft);font-size:.85rem">' + o.method + '</div></div></div>' +
        (o.status === 'ready' ? '<button class="btn green" style="width:100%;margin-top:16px" onclick="markCollected(\'' + o.id + '\')">I picked it up</button>' : '') +
        (o.status === 'collected' && !o.rating ? '<button class="btn" style="width:100%;margin-top:16px" onclick="S.activeOrder=\'' + o.id + '\';nav(\'review\')">Rate this order</button>' : '') + '</div>' +
        renderOrderLogs(o) +
        (mine.length > 1 ? '<h3 style="font-family:var(--disp);margin:24px 0 10px">Order history</h3>' + mine.map(x => '<div class="card" style="padding:14px 18px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="S.activeOrder=\'' + x.id + '\';save();mount()"><div><b class="money">' + x.id + '</b> - ' + x.items.length + ' item(s)<div style="color:var(--ink-soft);font-size:.82rem">' + new Date(x.time).toLocaleString('en-GB') + '</div></div><span class="pill ' + (x.status === 'collected' ? 'in' : x.status === 'ready' ? 'low' : 'out') + '">' + STATUS_LBL[x.status] + '</span></div>').join("") : '') + '</section>';
}

function renderOrderLogs(o) {
    const logs = o.logs || [];
    if (!logs.length) return '';
    return '<h3 style="font-family:var(--disp);margin:24px 0 10px">Transaction log</h3><div class="card" style="padding:14px 18px">' +
        logs.map(log => '<div class="summary"><span><b>' + log.action.replaceAll('_', ' ') + '</b><br><small style="color:var(--ink-soft)">' + (log.note || '') + '</small></span><span style="color:var(--ink-soft);font-size:.82rem">' + new Date(log.time).toLocaleString('en-GB') + '</span></div>').join("") +
        '</div>';
}

async function markCollected(id) {
    try {
        await apiJson("/api/orders/" + id + "/status", "PUT", { status: "COMPLETED" }, true);
        await syncFromApi();
        save();
        mount();
        toast("Picked up", "Drop a rating when you are ready.");
    } catch (e) {
        toast("Update failed", e.message, "chili");
    }
}

let _rating = 0;

function renderReview() {
    const o = S.orders.find(x => x.id === S.activeOrder) || S.orders[0];
    return '<section class="view">' + studentSubnav('tracking') + '<h1 class="title">Rate your meal</h1><p class="sub">Order ' + (o ? o.id : '') + ' - your rating updates the dish scores.</p>' +
        '<div class="card" style="padding:26px;max-width:460px"><div class="stars" id="stars">' + [1, 2, 3, 4, 5].map(n => '<span data-n="' + n + '" onmouseover="hoverStars(' + n + ')" onmouseout="hoverStars(0)" onclick="setRating(' + n + ')">*</span>').join("") + '</div>' +
        '<div class="field" style="margin-top:16px"><label>Your thoughts</label><textarea id="rtext" rows="3" placeholder="How was the food?"></textarea></div>' +
        '<button class="btn" style="margin-top:14px" onclick="submitReview(\'' + (o ? o.id : '') + '\')">Post review</button></div>' +
        '<h3 style="font-family:var(--disp);margin:26px 0 10px">Recent reviews</h3>' +
        S.reviews.map(r => '<div class="card" style="padding:14px 18px;margin-bottom:10px"><div style="color:var(--mustard)">' + "*".repeat(r.rating) + '<span style="color:var(--line-strong)">' + "*".repeat(5 - r.rating) + '</span></div><b>' + r.dish + '</b> - ' + r.text + ' <span style="color:var(--ink-faint)">- ' + r.who + '</span></div>').join("") + '</section>';
}

function hoverStars(n) { document.querySelectorAll("#stars span").forEach(s => s.classList.toggle("hover", Number(s.dataset.n) <= (n || _rating))); }

function setRating(n) {
    _rating = n;
    document.querySelectorAll("#stars span").forEach(s => s.classList.toggle("on", Number(s.dataset.n) <= n));
}

async function submitReview(id) {
    if (!_rating) { toast("Pick a rating", "Tap the stars first", "chili"); return; }
    const o = S.orders.find(x => x.id === id);
    const txt = (document.getElementById("rtext") && document.getElementById("rtext").value) || "Solid.";
    if (!o || !o.items.length) return;
    try {
        await apiJson("/api/reviews", "POST", {
            orderId: o.id,
            dishId: o.items[0].id,
            rating: _rating,
            comment: txt,
        }, true);
        S.reviews.unshift({ dish: o.items[0].name, rating: _rating, text: txt, who: S.user.name.split(" ")[0] });
        _rating = 0;
        await syncFromApi();
        save();
        toast("Thanks", "Your review is live");
        nav('tracking');
    } catch (e) {
        toast("Review failed", e.message, "chili");
    }
}

function renderVoting() {
    const ranked = [...S.menu].sort((a, b) => b.votes - a.votes);
    const max = ranked[0] ? ranked[0].votes || 1 : 1;
    return '<section class="view">' + studentSubnav('voting') + '<span class="eyebrow">Weekly menu vote</span><h1 class="title">Vote and suggest meals</h1>' +
        '<p class="sub">Voting is weekly. Cooks review suggestions and approve what the kitchen can actually prepare.</p>' +
        '<div class="card" style="padding:18px;margin-bottom:18px"><b>Suggest a meal for this week</b><div class="grid-2" style="gap:10px;margin-top:10px"><div class="field"><label>Meal name</label><input id="sugName" placeholder="e.g. Corn fufu and njama njama"></div><div class="field"><label>Short note</label><input id="sugDesc" placeholder="Why students would like it"></div></div><button class="btn sm" style="margin-top:10px" onclick="suggestMeal()">Send suggestion</button></div>' +
        '<div class="card" style="padding:22px">' + ranked.map(m => '<div class="bar-row"><span class="nm">' + m.name + '</span>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(12, (m.votes || 0) / max * 100) + '%">' + (m.votes || 0) + '</div></div>' +
            '<button class="btn sm ' + (S.votes[m.id] ? 'green' : '') + '" ' + (S.votes[m.id] ? 'disabled' : '') + ' onclick="castVote(\'' + m.id + '\')">' + (S.votes[m.id] ? 'Voted' : 'Vote') + '</button></div>').join("") + '</div></section>';
}

async function suggestMeal() {
    const name = (document.getElementById("sugName").value || "").trim();
    const description = (document.getElementById("sugDesc").value || "").trim();
    if (!name) { toast("Meal name required", "Enter the meal you want to suggest", "chili"); return; }
    try {
        await apiJson("/api/votes/suggestions", "POST", { name, description }, true);
        document.getElementById("sugName").value = "";
        document.getElementById("sugDesc").value = "";
        toast("Suggestion sent", "A cook will review if it can be prepared.");
    } catch (e) {
        toast("Suggestion failed", e.message, "chili");
    }
}

async function castVote(id) {
    if (S.votes[id]) return;
    try {
        await apiJson("/api/votes", "POST", { dishIds: [id] }, true);
        S.votes[id] = true;
        const dish = S.menu.find(m => m.id === id);
        if (dish) dish.votes = (dish.votes || 0) + 1;
        save();
        mount();
        toast("Vote counted", "Thanks for shaping tomorrow's menu");
    } catch (e) {
        toast("Vote failed", e.message, "chili");
    }
}
