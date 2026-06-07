/* Cart page behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("cartTableBody")) renderCartPage();
});

function renderCartPage() {
    if (!App.requireRole("STUDENT")) return;
    const body = document.getElementById("cartTableBody");
    const empty = document.getElementById("cartEmpty");
    const total = document.getElementById("cartTotal");
    const checkout = document.getElementById("checkoutButton");
    const items = Object.values(App.cart());
    body.innerHTML = "";
    empty.hidden = items.length > 0;
    let sum = 0;
    items.forEach(item => {
        sum += Number(item.price) * Number(item.quantity);
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + App.escape(item.name) + "</td><td>" + App.money(item.price) + "</td><td><input class='qty-input' type='number' min='1' value='" + item.quantity + "'></td><td>" + App.money(item.price * item.quantity) + "</td><td><button class='btn sm ghost' type='button'>Remove</button></td>";
        row.querySelector("input").addEventListener("change", event => updateQuantity(item.id, Number(event.target.value || 1)));
        row.querySelector("button").addEventListener("click", () => removeCartItem(item.id));
        body.appendChild(row);
    });
    total.textContent = App.money(sum);
    checkout.disabled = !items.length;
    checkout.addEventListener("click", () => App.nav("payment"));
}

function updateQuantity(id, quantity) {
    const cart = App.cart();
    if (!cart[id]) return;
    cart[id].quantity = Math.max(1, quantity);
    App.setCart(cart);
    renderCartPage();
}

function removeCartItem(id) {
    const cart = App.cart();
    delete cart[id];
    App.setCart(cart);
    renderCartPage();
}
