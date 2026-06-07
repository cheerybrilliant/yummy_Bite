/* Shared frontend helpers for Yummy Bite. JavaScript handles state, API calls, and events only. */
const App = (() => {
    const SESSION_KEY = "yummy_bite_session";
    const CART_KEY = "yummy_bite_cart";
    const ACTIVE_ORDER_KEY = "yummy_bite_active_order";
    const PENDING_PAYMENT_KEY = "yummy_bite_pending_payment";
    const API_BASE = window.API_BASE || (location.protocol === "file:" ? "http://localhost:5050" : location.origin);
    const MOMO_NUMBER = window.CANTEEN_MOMO_NUMBER || "6 70 00 00 00";

    const paths = window.PATHS || {
        home: "Student/Home.html",
        menu: "Student/Menu.html",
        about: "Student/About page.html",
        login: "Student/Login.html",
        register: "Student/Register.html",
        cart: "Student/Cart.html",
        payment: "Student/Payment.htm",
        tracking: "Student/Order tracking.html",
        review: "Student/Review.html",
        voting: "Student/Voting.html",
        staffLogin: "Staff/Staff-login.html",
        dashboard: "Staff/Staff-dashboard.html",
        paymentVerification: "Staff/Payment verification.html",
        adminMenu: "Admin/Menu-management.html",
        dailyMenu: "Admin/Daily-menu.html",
        votingResults: "Admin/Voting-results.html",
        analytics: "Admin/Analytics.html",
        manageCooks: "Admin/Manage-cooks.html"
    };

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function session() {
        return read(SESSION_KEY, null);
    }

    function setSession(data) {
        write(SESSION_KEY, data);
        renderHeader();
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(ACTIVE_ORDER_KEY);
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        location.href = path("home");
    }

    function cart() {
        return read(CART_KEY, {});
    }

    function setCart(value) {
        write(CART_KEY, value);
        updateCartCount();
    }

    function addCartItem(dish) {
        const items = cart();
        items[dish.id] = items[dish.id] || { id: dish.id, name: dish.name, price: dish.price, quantity: 0 };
        items[dish.id].quantity += 1;
        setCart(items);
        notice("Added to cart", dish.name);
    }

    function clearCart() {
        setCart({});
    }

    function token() {
        const current = session();
        return current ? current.token : "";
    }

    function user() {
        const current = session();
        return current ? current.user : null;
    }

    function authHeaders(extra = {}) {
        const headers = Object.assign({}, extra);
        if (token()) headers.Authorization = "Bearer " + token();
        return headers;
    }

    async function api(pathName, options = {}) {
        const response = await fetch(API_BASE + pathName, options);
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        if (!response.ok) throw new Error((data && data.message) || "Request failed");
        return data;
    }

    function apiJson(pathName, method = "GET", body = null, secured = false) {
        return api(pathName, {
            method,
            headers: Object.assign({ "Content-Type": "application/json" }, secured ? authHeaders() : {}),
            body: body ? JSON.stringify(body) : undefined
        });
    }

    function path(name) {
        return paths[name] || name;
    }

    function nav(name) {
        location.href = path(name);
    }

    function requireRole(role) {
        const current = user();
        if (!current || current.role !== role) {
            location.href = path("login");
            return false;
        }
        return true;
    }

    function requireAnyRole(roles) {
        const current = user();
        if (!current || !roles.includes(current.role)) {
            location.href = path("login");
            return false;
        }
        return true;
    }

    function money(value) {
        return new Intl.NumberFormat("fr-FR").format(Number(value || 0)) + " FCFA";
    }

    function escape(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function notice(title, message = "", type = "") {
        const box = document.getElementById("notice");
        if (!box) return;
        box.hidden = false;
        box.className = "notice " + type;
        box.innerHTML = "<strong>" + escape(title) + "</strong>" + (message ? "<span>" + escape(message) + "</span>" : "");
        setTimeout(() => { box.hidden = true; }, 4200);
    }

    function setActiveOrder(id) {
        localStorage.setItem(ACTIVE_ORDER_KEY, id || "");
    }

    function activeOrder() {
        return localStorage.getItem(ACTIVE_ORDER_KEY) || "";
    }

    function setPendingPayment(id) {
        localStorage.setItem(PENDING_PAYMENT_KEY, id || "");
    }

    function pendingPayment() {
        return localStorage.getItem(PENDING_PAYMENT_KEY) || "";
    }

    function updateCartCount() {
        const count = Object.values(cart()).reduce((total, item) => total + Number(item.quantity || 0), 0);
        document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent = count; });
    }

    function renderHeader() {
        const target = document.getElementById("roleSwitch");
        if (!target) return;
        const current = user();
        if (!current) {
            target.innerHTML = '<a class="btn-signin" href="' + path("login") + '">Log in</a><a class="chip" href="' + path("register") + '">Sign up</a>';
            return;
        }
        const home = current.role === "ADMIN" ? "adminMenu" : current.role === "STAFF" ? "dashboard" : "menu";
        target.innerHTML = '<a class="sess" href="' + path(home) + '">' + escape(current.name) + '</a><button class="chip" type="button" data-logout>Log out</button>';
        target.querySelector("[data-logout]").addEventListener("click", logout);
    }

    function statusText(status) {
        return {
            PENDING_PAYMENT: "Pending payment",
            AWAITING_VERIFICATION: "Awaiting verification",
            PAYMENT_CONFIRMED: "Payment confirmed",
            PREPARING: "Preparing",
            READY_FOR_COLLECTION: "Ready for pickup",
            COMPLETED: "Collected"
        }[status] || status || "Unknown";
    }

    function paymentText(status) {
        return { PENDING: "Pending", VERIFIED: "Verified", REJECTED: "Rejected" }[status] || "Not uploaded";
    }

    function start() {
        renderHeader();
        updateCartCount();
        document.querySelectorAll("[data-nav]").forEach(button => {
            button.addEventListener("click", () => nav(button.dataset.nav));
        });
    }

    document.addEventListener("DOMContentLoaded", start);

    return {
        API_BASE,
        MOMO_NUMBER,
        api,
        apiJson,
        authHeaders,
        cart,
        setCart,
        addCartItem,
        clearCart,
        session,
        setSession,
        logout,
        token,
        user,
        requireRole,
        requireAnyRole,
        path,
        nav,
        money,
        escape,
        notice,
        setActiveOrder,
        activeOrder,
        setPendingPayment,
        pendingPayment,
        statusText,
        paymentText,
        updateCartCount
    };
})();

function nav(name) {
    App.nav(name);
}
