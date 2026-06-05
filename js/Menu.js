/* menu.js — Home, Menu and About pages, plus dish rating */

function renderHome() {
    const specials = S.menu.filter(m => m.daily).slice(0, 3);
    const loved = [...S.menu].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 4);
    return '<section class="view">' + studentSubnav('home') +
        '<div class="hero"><div class="hero-l">' +
        '<span class="eyebrow">The ICT University</span>' +
        '<h1>The campus canteen,<br>now online.</h1>' +
        '<p class="sub">Browse today’s Cameroonian dishes, order ahead, pay with Mobile Money and skip the lunch-rush queue. Create a free account to see prices and order.</p>' +
        '<div class="cta"><button class="btn" onclick="nav(\'menu\')">See the menu →</button><button class="btn ghost" onclick="nav(\'login\')">Create account</button></div>' +
        '</div><div class="hero-r"><div class="ring" style="width:360px;height:360px"></div><div class="ring" style="width:240px;height:240px"></div>' +
        '<span class="float" style="top:30px;left:38px">🍗</span><span class="float" style="bottom:34px;right:40px">🥘</span><span class="float" style="bottom:46px;left:52px">🍩</span><span class="float" style="top:42px;right:48px">🧃</span>' +
        SVGART["rice-chicken"] + '</div></div>' +
        '<div class="band"><div><div class="bn">' + S.menu.length + '</div><div class="bl">Dishes on the menu</div></div>' +
        '<div><div class="bn">100% 🇨🇲</div><div class="bl">Cameroonian kitchen</div></div>' +
        '<div><div class="bn">&lt; 1 min</div><div class="bl">MoMo checkout</div></div>' +
        '<div><div class="bn">0</div><div class="bl">Queues to stand in</div></div></div>' +
        '<h2 class="sect">Today’s specials</h2><div class="menu-grid">' + specials.map(dishCard).join("") + '</div>' +
        '<h2 class="sect">How it works</h2><div class="steps">' +
        stepCard(1, "Browse", "See the daily Cameroonian menu with live stock.") +
        stepCard(2, "Pay", "Checkout with MTN MoMo or Orange Money in seconds.") +
        stepCard(3, "Get pinged", "We notify you the moment the cook marks it ready.") +
        stepCard(4, "Chop", "Show your Order ID, pick up, then rate your meal.") + '</div>' +
        '<h2 class="sect">Most loved on campus</h2><div class="menu-grid">' + loved.map(dishCard).join("") + '</div>' +
        '<h2 class="sect">What students say</h2><div class="review-strip">' +
        S.reviews.slice(0, 3).map(r => '<div class="card rev"><div class="st">' + "★".repeat(r.rating) + '</div><p>“' + r.text + '”</p><div class="who">— ' + r.who + ' · on ' + r.dish + '</div></div>').join("") + '</div>' +
        '<div class="cta-band"><h2>Hungry already?</h2><p style="max-width:46ch;margin:8px auto 16px">Join your coursemates ordering ahead. It is free, and prices unlock the moment you sign in.</p><button class="btn dark" onclick="nav(\'login\')">Create your account →</button></div>' +
        '</section>';
}

const FOUNDERS = [
    { n: "Tembong Jennette", r: "Project Lead & Founder", c: "#d6451f", b: "Initiated the ICTU Online Canteen and leads the team and the product vision." },
    { n: "Takow Brilliant", r: "Co-Founder", c: "#2f7d52", b: "Co-builds the platform and helps shape the ordering and kitchen experience." },
    { n: "Tameh Kigha Troy", r: "Co-Founder", c: "#e2960a", b: "Co-builds the platform and drives the menu, voting and feedback features." },
    { n: "Ntopi Melvin", r: "Co-Founder", c: "#2f6f9e", b: "Co-builds the platform and supports payments, testing and deployment." },
];

function renderAbout() {
    return '<section class="view">' + studentSubnav('about') +
        '<div class="about-head"><div class="blob" style="width:210px;height:210px;background:var(--chili);top:-40px;right:-30px;opacity:.6"></div>' +
        '<div class="blob" style="width:150px;height:150px;background:var(--mustard);bottom:-30px;left:30px;opacity:.4"></div>' +
        '<img class="about-logo" src="https://ictuniversity.org/wp-content/uploads/2021/03/ictu-logo.png" alt="The ICT University" onerror="this.style.display=\'none\'">' + '<span class="eyebrow" style="color:var(--mustard)">About us</span><h1>The ICT University<br>Online Canteen</h1>' +
        '<p>A student-built platform for The ICT University. Our mission is simple: make campus dining faster, fairer and fully cashless — order ahead, pay with Mobile Money, and get pinged when your food is ready.</p></div>' +
        '<h2 class="sect">Our story</h2>' +
        '<div class="prose"><p>Lunch break at ICT University is short, and the canteen queue is long. As <b>Level 300 students</b>, we kept losing half our break standing in line — and the kitchen had no clear view of who ordered what.</p>' +
        '<p>But the part that stayed with us was the <b>waiting</b>. You would pay, then linger by the counter with no way of knowing whether your food was two minutes away or twenty. We watched friends miss the start of a lecture, let a plate go cold, or quietly walk away hungry because no one could tell them when “ready” actually meant ready. One of us once waited out the whole break and ate nothing at all that day. It is a small thing — until it is your turn, your time, and your empty stomach.</p>' +
        '<p>That feeling is the reason this exists. We wanted the moment your food is ready to come and find <b>you</b> — not the other way round. So we built the <b>ICTU Online Canteen</b>: students order and pay from their phones, the kitchen works from a live order board, and the instant a cook marks a meal ready, the student’s phone buzzes. No hovering, no guessing, no cold food, no one left behind. Everything you see here was designed and built by our four-person team.</p></div>' +
        '<h2 class="sect">What we stand for</h2><div class="value-grid">' +
        '<div class="card value"><div class="ic">🎯</div><h3>Save time</h3><p>Reduce wait times and food waste so students spend the break eating, not queuing.</p></div>' +
        '<div class="card value"><div class="ic">📱</div><h3>Cashless & fair</h3><p>Transparent prices and instant Mobile Money receipts for everyone with an account.</p></div>' +
        '<div class="card value"><div class="ic">🗳️</div><h3>Student-led menu</h3><p>Students rate meals and vote on the next day’s menu — the canteen listens.</p></div></div>' +
        '<h2 class="sect">How it works</h2><div class="steps">' + stepCard(1, "Sign in", "Create a free account to unlock prices.") + stepCard(2, "Order & pay", "Pick dishes, pay with MoMo/Orange Money.") + stepCard(3, "Track", "Watch the live status from the kitchen.") + stepCard(4, "Rate & vote", "Score your meal and vote tomorrow’s menu.") + '</div>' +
        '<div class="band"><div><div class="bn">4</div><div class="bl">Student founders</div></div>' +
        '<div><div class="bn">L300</div><div class="bl">Level at The ICT University</div></div>' +
        '<div><div class="bn">' + S.menu.length + '</div><div class="bl">Cameroonian dishes</div></div>' +
        '<div><div class="bn">3</div><div class="bl">Roles: student · cook · admin</div></div></div>' +
        '<h2 class="sect">Meet the founders</h2><div class="founder-grid">' +
        FOUNDERS.map(f => '<div class="card founder"><div class="avatar" style="background:' + f.c + '">' + f.n.split(" ").map(x => x[0]).join("") + '</div>' +
            '<h3>' + f.n + '</h3><div class="role">' + f.r + '</div><span class="lvl">Level 300 · The ICT University</span><p>' + f.b + '</p></div>').join("") + '</div>' +
        '<h2 class="sect">Find us</h2><div class="contact"><div class="c-l"><h3 style="font-family:var(--disp);font-size:1.4rem;margin-bottom:6px">The ICTU canteen</h3>' +
        '<p style="color:var(--ink-soft)">Come collect your order at the campus canteen counter — just show your Order ID. Built and maintained by Level 300 students of The ICT University.</p></div>' +
        '<div class="c-r"><div>📍 The ICT University, Yaoundé, Cameroon</div><div>✉️ canteen@ictuniversity.edu.cm</div><div>🕑 Mon–Fri · 11:00–15:00</div></div></div>' +
        '<p class="photo-credit">Some dish photos courtesy of Wikimedia Commons (freely licensed). Cooks and admin can upload the canteen’s own photos for any dish.</p>' +
        '<div class="cta-band"><h2>Order with us today</h2><p style="max-width:46ch;margin:8px auto 16px">Sign in, see the prices, and skip the queue.</p><button class="btn dark" onclick="nav(\'login\')">Get started →</button></div>' +
        '</section>';
}

function renderMenu() {
    const list = S.menu.filter(m => (S.filter === "All" || m.cat === S.filter) && m.name.toLowerCase().includes((S.q || "").toLowerCase()));
    const pub = !S.user;
    const fab = (!pub && cartCount() > 0) ? '<button class="fab" onclick="nav(\'cart\')">🛒 View cart <span class="badge">' + cartCount() + '</span> · <span class="money">' + fmt(cartTotal()) + '</span></button>' : '';
    return '<section class="view">' + studentSubnav('menu') +
        '<span class="eyebrow">Daily Menu · ' + new Date().toLocaleDateString('en-GB', { weekday: 'long' }) + '</span>' +
        '<h1 class="title">' + (pub ? 'Today on the menu' : 'What you go chop today?') + '</h1>' +
        '<p class="sub">' + (pub ? 'Cameroonian dishes, cooked fresh. <b>Log in or register</b> to see prices and order.' : 'Live kitchen stock — sold-out items cannot be ordered. Tap a dish to rate it.') + '</p>' +
        '<div class="toolbar"><div class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c8e77" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>' +
        '<input placeholder="Search dishes…" value="' + (S.q || "") + '" oninput="S.q=this.value;save();mount()"></div>' +
        CATS.map(c => '<button class="chip ' + (S.filter === c ? 'on' : '') + '" onclick="S.filter=\'' + c + '\';save();mount()">' + c + '</button>').join("") + '</div>' +
        '<div class="menu-grid">' + (list.map(dishCard).join("") || '<div class="empty"><div class="em">🍽️</div>No dishes match.</div>') + '</div></section>' + fab;
}

function dishCard(m) {
    const out = m.stock === "out",
        locked = !S.user;
    return '<article class="card dish ' + (out ? 'sold' : '') + '">' + artFor(m) +
        '<div class="body"><h3>' + m.name + '</h3>' + starsHTML(avgRating(m)) +
        '<span class="pill ' + m.stock + '">' + (m.stock === 'in' ? '● In stock' : m.stock === 'low' ? '◐ Low stock' : '✕ Sold out') + '</span>' +
        '<div class="row">' +
        (locked ? '<span class="locked">🔒 Sign in for price</span>' : '<span class="money">' + fmt(m.price) + '</span>') +
        (locked ? '<button class="btn sm dark" onclick="nav(\'login\')">Sign in</button>' :
            '<button class="btn sm" ' + (out ? 'disabled' : '') + ' onclick="addToCart(\'' + m.id + '\')">' + (out ? 'Unavailable' : 'Add +') + '</button>') +
        '</div>' + (locked ? '' : '<span class="rate-link" onclick="rateDish(\'' + m.id + '\')">★ Rate this dish</span>') +
        '</div></article>';
}

/* ----- rate a dish directly ----- */
let _mrating = 0;

function rateDish(id) {
    if (!S.user) { nav('login'); return; }
    _mrating = 0;
    const m = S.menu.find(x => x.id === id);
    $("#modalRoot").innerHTML = '<div class="scrim" onclick="if(event.target===this)closeModal()"><div class="modal card" style="padding:24px">' +
        '<h2 style="font-family:var(--disp);font-size:1.4rem;margin-bottom:6px">Rate ' + m.name + '</h2>' +
        '<div style="color:var(--ink-soft);font-size:.88rem;margin-bottom:10px">Current: ' + (m.rCount ? avgRating(m).toFixed(1) + ' ★ (' + m.rCount + ' ratings)' : 'no ratings yet') + '</div>' +
        '<div class="stars" id="mstars">' + [1, 2, 3, 4, 5].map(n => '<span data-n="' + n + '" onmouseover="hoverM(' + n + ')" onmouseout="hoverM(0)" onclick="setM(' + n + ')">★</span>').join("") + '</div>' +
        '<div class="field" style="margin-top:14px"><label>Comment (optional)</label><textarea id="mtext" rows="3" placeholder="How was it?"></textarea></div>' +
        '<button class="btn" style="width:100%;margin-top:12px" onclick="submitDishRating(\'' + id + '\')">Submit rating</button>' +
        '<button class="btn ghost sm" style="width:100%;margin-top:8px;box-shadow:none" onclick="closeModal()">Cancel</button></div></div>';
}

function hoverM(n) { document.querySelectorAll("#mstars span").forEach(s => s.classList.toggle("hover", Number(s.dataset.n) <= (n || _mrating))); }

function setM(n) { _mrating = n;
    document.querySelectorAll("#mstars span").forEach(s => s.classList.toggle("on", Number(s.dataset.n) <= n)); }

function submitDishRating(id) {
    if (!_mrating) { toast("Pick a rating", "Tap the stars first ⭐", "chili"); return; }
    const m = S.menu.find(x => x.id === id);
    m.rSum += _mrating;
    m.rCount++;
    const txt = (document.getElementById("mtext") && document.getElementById("mtext").value) || "";
    if (txt) S.reviews.unshift({ dish: m.name, rating: _mrating, text: txt, who: S.user.name.split(" ")[0] });
    closeModal();
    mount();
    toast("Thanks for rating!", m.name + ' is now ' + avgRating(m).toFixed(1) + ' ★');
}