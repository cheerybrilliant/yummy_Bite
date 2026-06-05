/* payment.js — payment page + pay action */
function renderPayment() {
    if (!Object.keys(S.cart).length) { location.href = PATHS.menu; return ''; }
    const total = cartTotal() + 100;
    return '<section class="view">' + studentSubnav('') + '<button class="chip" onclick="nav(\'cart\')">← Back to cart</button>' +
        '<span class="eyebrow" style="display:block;margin-top:14px">Secure checkout · Paystack</span><h1 class="title">Payment</h1>' +
        '<div class="grid-2" style="align-items:start;margin-top:10px"><div class="card" style="padding:24px">' +
        '<h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Choose your wallet</h3>' +
        '<label class="pay-opt"><input type="radio" name="pm" value="MTN MoMo" checked><span class="lg">📱</span> MTN Mobile Money</label>' +
        '<label class="pay-opt"><input type="radio" name="pm" value="Orange Money"><span class="lg">🟠</span> Orange Money</label>' +
        '<div class="field" style="margin-top:14px"><label>Mobile Money number</label><input id="pphone" placeholder="6 7X XX XX XX" value="6 70 00 00 00"></div>' +
        '<button class="btn green" style="width:100%;margin-top:18px" onclick="payNow()">Pay ' + fmt(total) + ' →</button>' +
        '<p style="font-size:.78rem;color:var(--ink-faint);text-align:center;margin-top:10px">🔒 You will confirm on your phone.</p></div>' +
        '<div class="card" style="padding:24px;position:sticky;top:90px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:10px">Order summary</h3>' +
        Object.entries(S.cart).map(([id, q]) => { const m = S.menu.find(x => x.id === id); return '<div class="summary"><span>' + q + '× ' + m.name + '</span><span class="money">' + fmt(m.price * q) + '</span></div>' }).join("") +
        '<div class="summary"><span>Service fee</span><span class="money">' + fmt(100) + '</span></div>' +
        '<div class="summary total"><span>Total</span><span class="money">' + fmt(total) + '</span></div></div></div></section>';
}

function payNow() {
    const method = document.querySelector('input[name=pm]:checked').value;
    const items = Object.entries(S.cart).map(([id, q]) => { const m = S.menu.find(x => x.id === id); return { id, name: m.name, qty: q, price: m.price } });
    const order = { id: newId(), customer: S.user.name, method, paid: true, items, total: cartTotal() + 100, status: "received", time: Date.now(), rating: 0, review: "" };
    S.orders.unshift(order);
    S.activeOrder = order.id;
    S.cart = {};
    save();
    toast("Payment received ✓", method + ' · ' + fmt(order.total));
    nav('confirmation');
}