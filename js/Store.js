/* ICT University Cameroon — Online Canteen
   store.js — shared state, persistence, helpers, dish art, header/nav, router.
   State persists in localStorage so cart, login and orders survive moving between pages. */

const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + " FCFA";
const STATUS = ["received", "preparing", "ready", "collected"];
const STATUS_LBL = { received: "Received", preparing: "Cooking", ready: "Ready", collected: "Collected" };
const CATS = ["All", "Mains", "Soups", "Snacks", "Drinks"];

const PLATE = '<ellipse cx="120" cy="138" rx="86" ry="11" fill="rgba(0,0,0,.16)"/><ellipse cx="120" cy="92" rx="86" ry="52" fill="#fffdf7" stroke="#e7dcc4" stroke-width="3"/><ellipse cx="120" cy="90" rx="62" ry="36" fill="#f4ebd6"/>';
const BOWL = '<ellipse cx="120" cy="140" rx="78" ry="10" fill="rgba(0,0,0,.16)"/><path d="M52 92 a68 30 0 0 0 136 0 q-10 44 -68 44 q-58 0 -68 -44Z" fill="#eadfc6" stroke="#d8cba8" stroke-width="3"/><ellipse cx="120" cy="92" rx="68" ry="22" fill="#fffdf7" stroke="#e7dcc4" stroke-width="3"/>';

function svg(inner) { return '<svg viewBox="0 0 240 160" class="art" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }
const SVGART = {
    "rice-chicken": svg(PLATE + '<path d="M72 98 q48 -36 96 0 q-48 16 -96 0Z" fill="#e07b35"/><g fill="#c9641f"><circle cx="92" cy="90" r="2.4"/><circle cx="120" cy="84" r="2.4"/><circle cx="146" cy="92" r="2.4"/><circle cx="108" cy="95" r="2.2"/></g><g fill="#3f8f4a"><circle cx="100" cy="86" r="2"/><circle cx="138" cy="88" r="2"/></g><ellipse cx="150" cy="80" rx="21" ry="13" fill="#b9712e"/><ellipse cx="150" cy="77" rx="14" ry="8" fill="#d08b46"/><rect x="164" y="76" width="16" height="6" rx="3" fill="#f3e6c8"/><circle cx="181" cy="79" r="5" fill="#f3e6c8"/>'),
    "ndole": svg(PLATE + '<path d="M70 96 q44 -30 90 0 q-44 20 -90 0Z" fill="#2f6d39"/><g fill="#4f9a52"><circle cx="92" cy="92" r="2.6"/><circle cx="124" cy="86" r="2.6"/><circle cx="146" cy="94" r="2.4"/></g><g fill="#e7d39a"><circle cx="104" cy="90" r="2.2"/><circle cx="134" cy="92" r="2.2"/></g><g fill="#f1b734" stroke="#caa033" stroke-width="1.5"><ellipse cx="166" cy="72" rx="13" ry="8"/><ellipse cx="158" cy="86" rx="13" ry="8"/></g>'),
    "pouletdg": svg(PLATE + '<path d="M70 98 q50 -34 100 0 q-50 16 -100 0Z" fill="#f2c14e"/><g fill="#b9712e"><ellipse cx="100" cy="86" rx="11" ry="8"/><ellipse cx="138" cy="88" rx="11" ry="8"/><ellipse cx="120" cy="80" rx="10" ry="7"/></g><g fill="#cf3b25"><circle cx="92" cy="92" r="2.6"/><circle cx="150" cy="90" r="2.6"/></g><g fill="#3f8f4a"><circle cx="110" cy="94" r="2.4"/><circle cx="132" cy="94" r="2.4"/></g>'),
    "fufu-greens": svg(PLATE + '<ellipse cx="98" cy="86" rx="26" ry="20" fill="#fbf4e3" stroke="#ece0c4" stroke-width="2"/><path d="M126 96 q24 -26 48 0 q-24 16 -48 0Z" fill="#3a7a3f"/><g fill="#5aa05c"><circle cx="142" cy="90" r="2.4"/><circle cx="160" cy="92" r="2.4"/></g>'),
    "koki": svg(PLATE + '<rect x="80" y="74" width="48" height="30" rx="8" fill="#8a4e26"/><rect x="80" y="74" width="48" height="11" rx="6" fill="#9c5d31"/><path d="M82 76 q22 -8 44 0" stroke="#5f3417" stroke-width="2" fill="none"/><g fill="#f1b734" stroke="#caa033" stroke-width="1.5"><ellipse cx="156" cy="80" rx="13" ry="8"/><ellipse cx="150" cy="94" rx="13" ry="8"/></g>'),
    "soup-yellow": svg(BOWL + '<ellipse cx="120" cy="90" rx="60" ry="18" fill="#e8a014"/><ellipse cx="120" cy="88" rx="56" ry="15" fill="#f2b733"/><ellipse cx="120" cy="84" rx="15" ry="11" fill="#fbf4e3"/><path d="M92 90 q14 8 28 0 q14 -8 28 0" stroke="#b5341c" stroke-width="2.5" fill="none" opacity=".7"/>'),
    "soup-fish": svg(BOWL + '<ellipse cx="120" cy="90" rx="60" ry="18" fill="#b0381f"/><ellipse cx="120" cy="88" rx="56" ry="15" fill="#c0432a"/><path d="M96 86 q20 -12 40 0 q-8 8 -20 8 q-12 0 -20 -8Z" fill="#cdbfa6"/><path d="M136 86 l12 -6 l0 12Z" fill="#cdbfa6"/><circle cx="104" cy="85" r="1.6" fill="#3a2a22"/><g fill="#3f8f4a"><circle cx="92" cy="92" r="2.2"/><circle cx="150" cy="90" r="2.2"/></g><circle cx="132" cy="94" r="3" fill="#d8431f"/>'),
    "puffpuff": svg('<ellipse cx="120" cy="136" rx="80" ry="11" fill="rgba(0,0,0,.14)"/><path d="M52 120 l136 0 l-12 -26 l-112 0Z" fill="#efe2c4"/><g fill="#c87f33" stroke="#a8662440" stroke-width="1"><circle cx="92" cy="100" r="18"/><circle cx="126" cy="96" r="20"/><circle cx="160" cy="102" r="17"/><circle cx="110" cy="116" r="17"/><circle cx="146" cy="116" r="16"/></g><g fill="#dca055" opacity=".7"><circle cx="86" cy="94" r="5"/><circle cx="120" cy="90" r="5"/><circle cx="155" cy="96" r="4"/></g>'),
    "beignet": svg(PLATE + '<g fill="#cf9a45" stroke="#b07e2e" stroke-width="1"><ellipse cx="96" cy="84" rx="16" ry="12"/><ellipse cx="128" cy="80" rx="16" ry="12"/></g><g fill="#6b4326"><ellipse cx="140" cy="98" rx="6" ry="4"/><ellipse cx="120" cy="102" rx="6" ry="4"/><ellipse cx="100" cy="100" rx="6" ry="4"/><ellipse cx="156" cy="92" rx="6" ry="4"/></g>'),
    "plantain": svg(PLATE + '<g fill="#f1b734" stroke="#caa033" stroke-width="1.6"><ellipse cx="98" cy="80" rx="17" ry="10" transform="rotate(-18 98 80)"/><ellipse cx="128" cy="88" rx="17" ry="10" transform="rotate(12 128 88)"/><ellipse cx="120" cy="76" rx="17" ry="10" transform="rotate(-6 120 76)"/><ellipse cx="146" cy="78" rx="17" ry="10" transform="rotate(20 146 78)"/></g><g fill="#caa033" opacity=".5"><circle cx="98" cy="80" r="2"/><circle cx="128" cy="88" r="2"/><circle cx="146" cy="78" r="2"/></g>'),
    "drink-red": svg('<ellipse cx="120" cy="146" rx="40" ry="7" fill="rgba(0,0,0,.14)"/><path d="M96 42 l48 0 l-7 96 l-34 0Z" fill="rgba(255,255,255,.5)" stroke="#cdbfa6" stroke-width="2"/><path d="M99 64 l42 0 l-6 72 l-30 0Z" fill="#9e1b32"/><rect x="122" y="30" width="6" height="60" rx="3" fill="#e2960a" transform="rotate(12 125 60)"/><rect x="106" y="70" width="10" height="10" rx="2" fill="rgba(255,255,255,.5)"/><rect x="120" y="84" width="9" height="9" rx="2" fill="rgba(255,255,255,.45)"/>'),
    "water": svg('<ellipse cx="120" cy="146" rx="34" ry="7" fill="rgba(0,0,0,.14)"/><rect x="104" y="20" width="32" height="14" rx="3" fill="#2f6f9e"/><rect x="108" y="34" width="24" height="10" fill="#d9ecf6"/><path d="M104 44 q16 -6 32 0 l0 92 q-16 8 -32 0Z" fill="#cfe8f5" stroke="#a7cfe2" stroke-width="2"/><rect x="106" y="78" width="28" height="34" rx="4" fill="#fff" opacity=".75"/><path d="M110 60 l0 70" stroke="#fff" stroke-width="3" opacity=".6"/>'),
    "generic": svg(PLATE + '<circle cx="120" cy="86" r="22" fill="#cf9a45"/><path d="M104 86 q16 -14 32 0" stroke="#a8662b" stroke-width="2" fill="none"/>'),
};
const ART_KINDS = ["rice-chicken", "ndole", "pouletdg", "fufu-greens", "koki", "soup-yellow", "soup-fish", "puffpuff", "beignet", "plantain", "drink-red", "water", "generic"];
const KIND_LBL = { "rice-chicken": "Rice & chicken", "ndole": "Greens stew + plantain", "pouletdg": "Mixed plate + chicken", "fufu-greens": "Fufu + greens", "koki": "Koki + plantain", "soup-yellow": "Yellow soup bowl", "soup-fish": "Pepper soup bowl", "puffpuff": "Fried dough balls", "beignet": "Beignets + beans", "plantain": "Plantain slices", "drink-red": "Red drink (glass)", "water": "Water bottle", "generic": "Generic plate" };

/* Wikimedia Commons photo URL (free-licensed, hotlinkable). */
function WM(file, w) { return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=' + (w || 600); }

function DEFAULT_STATE() {
    const s = {
        user: null,
        staff: null,
        admin: false,
        loginRole: null,
        authTab: "login",
        filter: "All",
        q: "",
        cart: {},
        orders: [],
        activeOrder: null,
        votes: {},
        cooks: [
            { id: "c1", name: "Chef Awah", staffId: "cook-01", pass: "demo1234" },
            { id: "c2", name: "Mama Ngozi", staffId: "cook-02", pass: "demo1234" },
        ],
        menu: [
            { id: "m1", name: "Ndolé & Plantain", cat: "Mains", price: 2500, kind: "ndole", img: WM("Ndolé camerounais.JPG"), stock: "in", votes: 42, daily: true, rSum: 46, rCount: 10 },
            { id: "m2", name: "Jollof Rice + Chicken", cat: "Mains", price: 2000, kind: "rice-chicken", img: WM("JOLLOF RICE WITH CHICKEN.jpg"), stock: "in", votes: 67, daily: true, rSum: 58, rCount: 12 },
            { id: "m3", name: "Poulet DG", cat: "Mains", price: 3000, kind: "pouletdg", img: WM("Poulet DG.JPG"), stock: "low", votes: 51, daily: false, rSum: 41, rCount: 9 },
            { id: "m4", name: "Eru & Water Fufu", cat: "Mains", price: 2200, kind: "fufu-greens", img: "", stock: "in", votes: 38, daily: false, rSum: 33, rCount: 8 },
            { id: "m5", name: "Koki & Ripe Plantain", cat: "Mains", price: 1800, kind: "koki", img: "", stock: "in", votes: 29, daily: false, rSum: 21, rCount: 5 },
            { id: "m6", name: "Achu & Yellow Soup", cat: "Soups", price: 2800, kind: "soup-yellow", img: "", stock: "in", votes: 36, daily: false, rSum: 27, rCount: 6 },
            { id: "m7", name: "Fish Pepper Soup", cat: "Soups", price: 2800, kind: "soup-fish", img: "", stock: "out", votes: 33, daily: false, rSum: 30, rCount: 7 },
            { id: "m8", name: "Puff-Puff (x5)", cat: "Snacks", price: 500, kind: "puffpuff", img: "", stock: "in", votes: 71, daily: true, rSum: 61, rCount: 13 },
            { id: "m9", name: "Beignet-Haricot", cat: "Snacks", price: 800, kind: "beignet", img: "", stock: "low", votes: 44, daily: false, rSum: 38, rCount: 9 },
            { id: "m10", name: "Fried Plantain (Dodo)", cat: "Snacks", price: 700, kind: "plantain", img: "", stock: "in", votes: 25, daily: false, rSum: 23, rCount: 6 },
            { id: "m11", name: "Folere / Bissap", cat: "Drinks", price: 600, kind: "drink-red", img: "", stock: "in", votes: 22, daily: false, rSum: 19, rCount: 5 },
            { id: "m12", name: "Bottled Water", cat: "Drinks", price: 300, kind: "water", img: "", stock: "in", votes: 8, daily: false, rSum: 9, rCount: 2 },
        ],
        reviews: [
            { dish: "Jollof Rice + Chicken", rating: 5, text: "Best on campus, no cap.", who: "Aïcha" },
            { dish: "Puff-Puff (x5)", rating: 4, text: "Warm and sweet, perfect break snack.", who: "Eric" },
            { dish: "Ndolé & Plantain", rating: 5, text: "Tastes like home. Quick pickup too.", who: "Marlyse" },
        ],
    };
    s.orders.push({
        id: "CHT-7F3A",
        customer: "Sandrine M.",
        method: "MTN MoMo",
        paid: true,
        items: [{ id: "m2", name: "Jollof Rice + Chicken", qty: 1, price: 2000 }, { id: "m8", name: "Puff-Puff (x5)", qty: 2, price: 500 }],
        total: 3100,
        status: "preparing",
        time: Date.now() - 300000,
        rating: 0,
        review: ""
    });
    s.orders.push({
        id: "CHT-2B91",
        customer: "Boris K.",
        method: "Orange Money",
        paid: false,
        items: [{ id: "m3", name: "Poulet DG", qty: 1, price: 3000 }],
        total: 3100,
        status: "received",
        time: Date.now() - 90000,
        rating: 0,
        review: ""
    });
    return s;
}

const LS_KEY = "ictu_canteen_v2";

function load() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }

function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }

function resetData() { localStorage.removeItem(LS_KEY);
    location.href = PATHS.home; }
let S = load() || DEFAULT_STATE();

const API_BASE = window.API_BASE || (location.protocol === "file:" ? "http://localhost:5050" : location.origin);
const API_ON = true;

function token() {
    return S.token || (S.user && S.user.token) || (S.staff && S.staff.token) || (S.adminUser && S.adminUser.token) || "";
}

function authHeaders(extra) {
    const h = Object.assign({}, extra || {});
    const t = token();
    if (t) h.Authorization = "Bearer " + t;
    return h;
}

async function api(path, opts) {
    const res = await fetch(API_BASE + path, opts || {});
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error((data && data.message) || "Request failed");
    return data;
}

async function apiJson(path, method, body, secured) {
    return api(path, {
        method: method || "GET",
        headers: Object.assign({ "Content-Type": "application/json" }, secured ? authHeaders() : {}),
        body: body ? JSON.stringify(body) : undefined,
    });
}

function catToUi(category) {
    const c = String(category || "Mains");
    return c === "BREAKFAST" || c === "LUNCH" ? "Mains" : c === "SNACK" ? "Snacks" : c;
}

function dishToUi(dish, daily) {
    const source = dish.dish || dish;
    const qty = typeof dish.quantity === "number" ? dish.quantity : (daily ? 20 : 0);
    const existing = S.menu.find(m => m.id === source.id) || {};
    return Object.assign({}, existing, {
        id: source.id,
        name: source.name,
        cat: catToUi(source.category),
        price: source.price,
        kind: existing.kind || "generic",
        img: source.image || "",
        stock: qty <= 0 ? "out" : qty <= 5 ? "low" : "in",
        daily: Boolean(daily),
        dailyMenuId: daily && dish.id ? dish.id : existing.dailyMenuId,
        votes: existing.votes || 0,
        rSum: existing.rSum || 0,
        rCount: existing.rCount || 0,
    });
}

function orderStatusToUi(status) {
    return {
        PENDING_PAYMENT: "received",
        AWAITING_VERIFICATION: "received",
        PAYMENT_CONFIRMED: "received",
        PREPARING: "preparing",
        READY_FOR_COLLECTION: "ready",
        COMPLETED: "collected",
    }[status] || "received";
}

function orderStatusToApi(status) {
    return {
        received: "PREPARING",
        preparing: "READY_FOR_COLLECTION",
        ready: "COMPLETED",
        collected: "COMPLETED",
    }[status] || status;
}

function orderToUi(order) {
    return {
        id: order.id,
        customer: order.student ? order.student.name : (S.user && S.user.name) || "Student",
        method: order.payment ? "Mobile Money" : "Pending payment",
        paid: Boolean(order.payment && order.payment.status === "VERIFIED") || ["PAYMENT_CONFIRMED", "PREPARING", "READY_FOR_COLLECTION", "COMPLETED"].includes(order.status),
        paymentId: order.payment && order.payment.id,
        paymentStatus: order.payment && order.payment.status,
        items: (order.items || []).map(item => ({
            id: item.dishId || (item.dish && item.dish.id),
            name: item.dish ? item.dish.name : "Dish",
            qty: item.quantity,
            price: item.price,
        })),
        total: order.totalAmount,
        status: orderStatusToUi(order.status),
        apiStatus: order.status,
        time: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
        rating: 0,
        review: "",
    };
}

async function syncMenuFromApi() {
    const dishes = await api("/api/dishes");
    let today = [];
    try { today = await api("/api/daily-menu/today"); } catch (e) { today = []; }
    const dailyByDish = new Map(today.map(item => [item.dishId, item]));
    S.menu = dishes.map(dish => dishToUi(dailyByDish.get(dish.id) || dish, dailyByDish.has(dish.id)));
}

async function syncOrdersFromApi() {
    if (!token()) return;
    if (S.admin || S.staff) {
        S.orders = (await api("/api/orders", { headers: authHeaders() })).map(orderToUi);
    } else if (S.user && S.user.id) {
        S.orders = (await api("/api/orders/student/" + S.user.id, { headers: authHeaders() })).map(orderToUi);
    }
}

async function syncFromApi() {
    if (!API_ON) return;
    try {
        await syncMenuFromApi();
        await syncOrdersFromApi();
        save();
    } catch (e) {
        console.warn("API sync failed; using local cached state", e);
    }
}

function setAuthSession(payload) {
    S.token = payload.token;
    const role = payload.user.role;
    const person = Object.assign({}, payload.user, { token: payload.token });
    S.user = role === "STUDENT" ? person : null;
    S.staff = role === "STAFF" ? person : null;
    S.admin = role === "ADMIN";
    S.adminUser = role === "ADMIN" ? person : null;
    S.loginRole = null;
}

const $ = s => document.querySelector(s);
const cartCount = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
const cartTotal = () => Object.entries(S.cart).reduce((t, [id, q]) => { const m = S.menu.find(x => x.id === id); return t + (m ? m.price * q : 0) }, 0);
const newId = () => "CHT-" + Math.random().toString(36).slice(2, 6).toUpperCase();
const salesTotal = () => S.orders.filter(o => o.paid).reduce((t, o) => t + o.total, 0);
const avgRating = m => m.rCount ? m.rSum / m.rCount : 0;

function toast(t, m, k = "") {
    const z = $("#toasts");
    if (!z) return;
    const el = document.createElement("div");
    el.className = "toast " + k;
    el.innerHTML = '<div style="font-size:1.3rem">🔔</div><div><div class="ti">' + t + '</div><div class="tx">' + m + '</div></div>';
    z.appendChild(el);
    setTimeout(() => { el.style.transition = ".3s";
        el.style.opacity = "0";
        el.style.transform = "translateX(40px)";
        setTimeout(() => el.remove(), 300) }, 4200);
}

/* dish visual: real photo on top, illustration behind as automatic fallback */
function artFor(m) {
    const daily = m.daily ? '<span class="daily-tag">★ Today’s pick</span>' : '';
    const tag = '<span class="cat-tag">' + m.cat + '</span>' + daily;
    const fb = '<div class="art-fallback">' + (SVGART[m.kind] || SVGART.generic) + '</div>';
    const img = m.img ? '<img class="photo-img" src="' + m.img + '" alt="' + m.name + '" loading="lazy" onerror="this.style.display=\'none\'">' : '';
    return '<div class="photo" data-cat="' + m.cat + '">' + fb + img + tag + '</div>';
}

function thumbFor(m) {
    const fb = (SVGART[m.kind] || SVGART.generic);
    const img = m.img ? '<img class="thumb-img" src="' + m.img + '" onerror="this.style.display=\'none\'">' : '';
    return '<span class="thumb">' + fb + img + '</span>';
}

function starsHTML(avg) { let s = ''; const full = Math.round(avg); for (let i = 1; i <= 5; i++) s += '<span class="' + (i <= full ? '' : 'g') + '">★</span>'; return '<span class="mini-stars">' + s + ' <b>' + (avg ? avg.toFixed(1) : 'new') + '</b></span>'; }

function stepCard(n, h, p) { return '<div class="card step-card"><div class="num">' + n + '</div><h3>' + h + '</h3><p>' + p + '</p></div>'; }

function nav(name) { save();
    location.href = (window.PATHS && PATHS[name]) || name; }

function closeModal() { const r = $("#modalRoot"); if (r) r.innerHTML = ""; }

function logout() { S.user = null;
    S.staff = null;
    S.admin = false;
    S.adminUser = null;
    S.token = "";
    S.cart = {};
    S.loginRole = null;
    save();
    nav('home'); }

/* header shows only the current session (portals are hidden, reached via role login) */
function renderHeader() {
    const rs = $("#roleSwitch");
    if (!rs) return;
    let html;
    if (S.admin) html = '<span class="sess">🛠️ Admin</span><button class="chip" onclick="logout()">Log out</button>';
    else if (S.staff) html = '<span class="sess">👩‍🍳 ' + (S.staff.name || 'Cook') + '</span><button class="chip" onclick="logout()">Log out</button>';
    else if (S.user) html = '<span class="sess">🎓 ' + S.user.name.split(" ")[0] + '</span><button class="chip" onclick="logout()">Log out</button>';
    else html = '<button class="btn-signin" onclick="nav(\'login\')">Log in / Sign up</button>';
    rs.innerHTML = html;
}

function studentSubnav(active) {
    const items = S.user ? [
            ["menu", "Menu"],
            ["tracking", "My Orders"],
            ["voting", "Vote"],
            ["about", "About"]
        ] :
        [
            ["home", "Home"],
            ["menu", "Menu"],
            ["about", "About"]
        ];
    return '<div class="subnav">' + items.map(([k, l]) => '<button class="chip ' + (active === k ? 'on' : '') + '" onclick="nav(\'' + k + '\')">' + l + '</button>').join("") + '</div>';
}

function staffSubnav(active) {
    return '<div class="subnav">' + [
        ["dashboard", "Order board"],
        ["paymentVerification", "Payment verification"]
    ].map(([k, l]) => '<button class="chip ' + (active === k ? 'on' : '') + '" onclick="nav(\'' + k + '\')">' + l + '</button>').join("") + '</div>';
}

function adminSubnav(active) {
    return '<div class="subnav">' + [
        ["adminMenu", "Menu"],
        ["dailyMenu", "Daily menu"],
        ["votingResults", "Voting"],
        ["analytics", "Analytics"],
        ["manageCooks", "Cooks"]
    ].map(([k, l]) => '<button class="chip ' + (active === k ? 'on' : '') + '" onclick="nav(\'' + k + '\')">' + l + '</button>').join("") + '</div>';
}

const NEEDS_USER = ["cart", "payment", "confirmation", "receipt", "tracking", "review", "voting"];
const NEEDS_STAFF = ["dashboard", "paymentVerification"];
const NEEDS_ADMIN = ["adminMenu", "dailyMenu", "votingResults", "analytics", "manageCooks"];

function mount() {
    save();
    renderHeader();
    const el = $("#app");
    if (!el) return;
    const P = window.PAGE;
    if (NEEDS_USER.includes(P) && !S.user) { location.href = PATHS.login; return; }
    if (NEEDS_STAFF.includes(P) && !S.staff) { location.href = PATHS.login; return; }
    if (NEEDS_ADMIN.includes(P) && !S.admin) { location.href = PATHS.login; return; }
    switch (P) {
        case "home":
            el.innerHTML = renderHome();
            break;
        case "menu":
            el.innerHTML = renderMenu();
            break;
        case "about":
            el.innerHTML = renderAbout();
            break;
        case "login":
            el.innerHTML = renderLogin();
            break;
        case "register":
            S.loginRole = "student";
            S.authTab = "register";
            el.innerHTML = renderLogin();
            break;
        case "cart":
            el.innerHTML = renderCart();
            break;
        case "payment":
            el.innerHTML = renderPayment();
            break;
        case "confirmation":
            el.innerHTML = renderConfirmation();
            break;
        case "receipt":
            el.innerHTML = renderConfirmation(true);
            break;
        case "tracking":
            el.innerHTML = renderTracking();
            break;
        case "review":
            el.innerHTML = renderReview();
            break;
        case "voting":
            el.innerHTML = renderVoting();
            break;
        case "staffLogin":
            S.loginRole = "cook";
            el.innerHTML = renderLogin();
            break;
        case "dashboard":
            el.innerHTML = renderDashboard();
            break;
        case "paymentVerification":
            el.innerHTML = renderPaymentVerification();
            break;
        case "adminMenu":
            el.innerHTML = renderMenuManagement();
            break;
        case "dailyMenu":
            el.innerHTML = renderDailyMenu();
            break;
        case "votingResults":
            el.innerHTML = renderVotingResults();
            break;
        case "analytics":
            el.innerHTML = renderAnalytics();
            break;
        case "manageCooks":
            el.innerHTML = renderManageCooks();
            break;
        default:
            el.innerHTML = '<section class="view"><div class="empty"><div class="em">🍽️</div>Page not found.</div></section>';
    }
}
async function initApp() {
    await syncFromApi();
    mount();
}
window.addEventListener("DOMContentLoaded", initApp);
