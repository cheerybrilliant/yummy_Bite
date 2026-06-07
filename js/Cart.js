/* cart.js — cart page + add/change operations */
function renderCart() {
    const ids = Object.keys(S.cart);
    if (!ids.length) return '<section class="view">' + studentSubnav('cart') + '<div class="empty"><div class="em">🛒</div><h2 style="font-family:var(--disp)">Your cart is empty</h2><button class="btn" style="margin-top:14px" onclick="nav(\'menu\')">Browse the menu</button></div></section>';
    return '<section class="view">' + studentSubnav('cart') + '<button class="chip" onclick="nav(\'menu\')">← Keep ordering</button>' +
        '<h1 class="title" style="margin-top:14px">Your basket</h1>' +
        '<div class="grid-2" style="align-items:start;margin-top:10px"><div class="card" style="padding:6px 22px 18px">' +
        ids.map(id => {
            const m = S.menu.find(x => x.id === id);
            const q = S.cart[id];
            return '<div class="line-item"><span class="em">🍽️</span>' +
                '<div style="flex:1"><b>' + m.name + '</b><div class="money" style="color:var(--ink-soft);font-size:.85rem">' + fmt(m.price) + '</div></div>' +
                '<div class="qty"><button onclick="chgQty(\'' + id + '\',-1)">–</button><b>' + q + '</b><button onclick="chgQty(\'' + id + '\',1)">+</button></div></div>'
        }).join("") + '</div>' +
        '<div class="card" style="padding:22px;position:sticky;top:90px"><h3 style="font-family:var(--disp);font-size:1.4rem;margin-bottom:10px">Summary</h3>' +
        '<div class="summary"><span>Subtotal</span><span class="money">' + fmt(cartTotal()) + '</span></div>' +
        '<div class="summary"><span>Service fee</span><span class="money">' + fmt(100) + '</span></div>' +
        '<div class="summary total"><span>Total</span><span class="money">' + fmt(cartTotal() + 100) + '</span></div>' +
        '<button class="btn" style="width:100%;margin-top:16px" onclick="nav(\'payment\')">Proceed to payment →</button></div></div></section>';
}

function addToCart(id) { S.cart[id] = (S.cart[id] || 0) + 1;
    save();
    mount(); const m = S.menu.find(x => x.id === id);
    toast("Added to cart", m.name + ' · ' + fmt(m.price)); }

function chgQty(id, d) { S.cart[id] += d; if (S.cart[id] <= 0) delete S.cart[id];
    save();
    mount(); }