/* payment.js - payment page and API checkout */
function renderPayment() {
    if (!Object.keys(S.cart).length) { location.href = PATHS.menu; return ''; }
    const total = cartTotal() + 100;
    return '<section class="view">' + studentSubnav('') + '<button class="chip" onclick="nav(\'cart\')">Back to cart</button>' +
        '<span class="eyebrow" style="display:block;margin-top:14px">Secure checkout</span><h1 class="title">Payment</h1>' +
        '<div class="grid-2" style="align-items:start;margin-top:10px"><div class="card" style="padding:24px">' +
        '<h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Choose your wallet</h3>' +
        '<label class="pay-opt"><input type="radio" name="pm" value="MTN MoMo" checked><span class="lg">MTN</span> MTN Mobile Money</label>' +
        '<label class="pay-opt"><input type="radio" name="pm" value="Orange Money"><span class="lg">OM</span> Orange Money</label>' +
        '<div class="field" style="margin-top:14px"><label>Mobile Money number</label><input id="pphone" placeholder="6 7X XX XX XX" value="6 70 00 00 00"></div>' +
        '<button class="btn green" style="width:100%;margin-top:18px" onclick="payNow()">Pay ' + fmt(total) + '</button>' +
        '<p style="font-size:.78rem;color:var(--ink-faint);text-align:center;margin-top:10px">Your payment will be verified by staff.</p></div>' +
        '<div class="card" style="padding:24px;position:sticky;top:90px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:10px">Order summary</h3>' +
        Object.entries(S.cart).map(([id, q]) => { const m = S.menu.find(x => x.id === id); return '<div class="summary"><span>' + q + ' x ' + m.name + '</span><span class="money">' + fmt(m.price * q) + '</span></div>' }).join("") +
        '<div class="summary"><span>Service fee</span><span class="money">' + fmt(100) + '</span></div>' +
        '<div class="summary total"><span>Total</span><span class="money">' + fmt(total) + '</span></div></div></div></section>';
}

async function payNow() {
    const method = document.querySelector('input[name=pm]:checked').value;
    const items = Object.entries(S.cart).map(([id, q]) => {
        const m = S.menu.find(x => x.id === id);
        return { id, name: m.name, qty: q, price: m.price };
    });
    try {
        const placed = await apiJson("/api/orders", "POST", {
            items: items.map(item => ({ dishId: item.id, quantity: item.qty })),
        }, true);
        await apiJson("/api/payments", "POST", {
            orderId: placed.orderId,
            transactionId: method + "-" + Date.now(),
            screenshot: "manual-mobile-money",
        }, true);
        S.activeOrder = placed.orderId;
        S.cart = {};
        await syncFromApi();
        save();
        toast("Payment submitted", method + " payment is awaiting verification");
        nav('confirmation');
    } catch (e) {
        toast("Checkout failed", e.message, "chili");
    }
}
