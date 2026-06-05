/* admin.js — menu management, daily menu, voting results, analytics, meal upload */

function renderMenuManagement() {
    return '<section class="view">' + adminSubnav('adminMenu') + '<span class="eyebrow">Admin Console</span><h1 class="title">Menu management</h1>' +
        '<p class="sub">Add, edit, upload photos for and manage every dish on the canteen menu.</p>' +
        '<div class="card" style="padding:22px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px"><h3 style="font-family:var(--disp);font-size:1.3rem">All dishes (' + S.menu.length + ')</h3><button class="btn sm" onclick="mealForm(\'\')">+ Add dish</button></div>' +
        '<div style="overflow-x:auto"><table><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th><th>Today</th><th>Edit</th><th></th></tr></thead><tbody>' +
        S.menu.map(m => '<tr><td>' + thumbFor(m) + '<b>' + m.name + '</b></td><td>' + m.cat + '</td><td class="money">' + fmt(m.price) + '</td><td class="money">' + (m.rCount ? avgRating(m).toFixed(1) + '★' : '—') + '</td>' +
            '<td><button class="pill ' + m.stock + '" style="border:none;cursor:pointer" onclick="cycleStock(\'' + m.id + '\')">' + (m.stock === 'in' ? 'In stock' : m.stock === 'low' ? 'Low' : 'Sold out') + '</button></td>' +
            '<td><button class="btn sm ' + (m.daily ? 'mustard' : 'ghost') + '" style="box-shadow:none;padding:5px 11px" onclick="toggleDaily(\'' + m.id + '\')">' + (m.daily ? '★' : '☆') + '</button></td>' +
            '<td><button class="btn sm ghost" style="box-shadow:none;padding:6px 12px" onclick="mealForm(\'' + m.id + '\')">✎ Edit</button></td>' +
            '<td><button class="btn sm ghost" style="box-shadow:none;padding:6px 10px" onclick="delDish(\'' + m.id + '\')">✕</button></td></tr>').join("") +
        '</tbody></table></div></div></section>';
}

function renderDailyMenu() {
    const daily = S.menu.filter(m => m.daily);
    return '<section class="view">' + adminSubnav('dailyMenu') + '<span class="eyebrow">Admin Console</span><h1 class="title">Today’s daily menu</h1>' +
        '<p class="sub">Toggle ★ to feature a dish to students now, or publish the top-voted dishes in one tap.</p>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><button class="btn sm green" onclick="publishTop()">Publish top 5 voted →</button><button class="btn sm" onclick="mealForm(\'\')">+ Upload meal</button></div>' +
        '<div class="card" style="padding:18px;margin-bottom:18px"><b>On the menu today (' + daily.length + '):</b> ' + (daily.length ? daily.map(m => m.name).join(", ") : '<span style="color:var(--ink-faint)">none yet</span>') + '</div>' +
        '<div class="menu-grid">' + S.menu.map(m => '<article class="card dish">' + artFor(m) + '<div class="body"><h3>' + m.name + '</h3>' +
            '<span class="pill ' + m.stock + '">' + (m.stock === 'in' ? '● In stock' : m.stock === 'low' ? '◐ Low' : '✕ Sold out') + '</span>' +
            '<div class="row"><span class="money">' + fmt(m.price) + '</span><button class="btn sm ' + (m.daily ? 'mustard' : 'dark') + '" onclick="toggleDaily(\'' + m.id + '\')">' + (m.daily ? '★ On menu' : '☆ Add') + '</button></div></div></article>').join("") + '</div></section>';
}

function renderVotingResults() {
    const ranked = [...S.menu].sort((a, b) => b.votes - a.votes);
    const maxV = ranked[0] ? ranked[0].votes : 1;
    const totalVotes = S.menu.reduce((t, m) => t + m.votes, 0);
    return '<section class="view">' + adminSubnav('votingResults') + '<span class="eyebrow">Admin Console</span><h1 class="title">Voting results</h1>' +
        '<p class="sub">Live student votes for tomorrow’s menu — ' + totalVotes + ' votes total.</p>' +
        '<div class="card" style="padding:22px">' + ranked.map((m, i) => '<div class="bar-row"><span class="nm">' + (i + 1) + '. ' + m.name + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(12, m.votes / maxV * 100) + '%">' + m.votes + '</div></div></div>').join("") +
        '<button class="btn green sm" style="margin-top:12px" onclick="publishTop()">Publish top 5 to daily menu</button></div></section>';
}

function renderAnalytics() {
    const avg = (() => { const r = S.orders.filter(o => o.rating); return r.length ? (r.reduce((t, o) => t + o.rating, 0) / r.length).toFixed(1) : "—" })();
    const week = [14, 22, 18, 31, 27, 9, 12];
    const maxW = Math.max(...week);
    const top = [...S.menu].sort((a, b) => avgRating(b) - avgRating(a)).slice(0, 5);
    return '<section class="view">' + adminSubnav('analytics') + '<span class="eyebrow">Admin Console</span><h1 class="title">Analytics</h1>' +
        '<div class="grid-3" style="margin:6px 0 22px"><div class="card stat locked-stat"><div class="n">' + fmt(salesTotal()) + '</div><div class="l">💰 Sales today (admin only)</div></div>' +
        '<div class="card stat"><div class="n">' + S.orders.length + '</div><div class="l">Orders placed</div></div>' +
        '<div class="card stat"><div class="n">' + avg + ' ★</div><div class="l">Avg. order rating</div></div></div>' +
        '<div class="grid-2" style="align-items:start"><div class="card" style="padding:22px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Orders this week</h3>' +
        '<div class="spark">' + week.map(v => '<span style="height:' + (v / maxW * 100) + '%" title="' + v + ' orders"></span>').join("") + '</div>' +
        '<div style="display:flex;justify-content:space-between;color:var(--ink-faint);font-size:.74rem;margin-top:8px">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => '<span>' + d + '</span>').join("") + '</div></div>' +
        '<div class="card" style="padding:22px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:14px">Top rated dishes</h3>' +
        top.map((m, i) => '<div class="bar-row"><span class="nm">' + (i + 1) + '. ' + m.name + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (avgRating(m) / 5 * 100) + '%">' + avgRating(m).toFixed(1) + '★</div></div></div>').join("") + '</div></div></section>';
}

/* ----- shared CRUD ----- */
function cycleStock(id) { const m = S.menu.find(x => x.id === id);
    m.stock = { in: "low", low: "out", out: "in" }[m.stock];
    save();
    mount(); }

function delDish(id) { S.menu = S.menu.filter(m => m.id !== id);
    save();
    mount();
    toast("Dish removed", "Menu updated", "chili"); }

function toggleDaily(id) { const m = S.menu.find(x => x.id === id);
    m.daily = !m.daily;
    save();
    mount();
    toast(m.daily ? 'Added to today’s menu' : 'Removed from today’s menu', m.name); }

function publishTop() { const top = [...S.menu].sort((a, b) => b.votes - a.votes).slice(0, 5).map(m => m.id);
    S.menu.forEach(m => m.daily = top.includes(m.id));
    save();
    mount();
    toast("Daily menu published", "Top 5 voted dishes are now today’s specials 📅"); }

/* ----- meal form with image upload (used by admin + cook) ----- */
let _imgData = "";

function mealForm(id) {
    const m = id ? S.menu.find(x => x.id === id) : { name: "", cat: "Mains", price: 1500, kind: "generic", img: "", stock: "in", daily: false };
    _imgData = m.img || "";
    $("#modalRoot").innerHTML = '<div class="scrim" onclick="if(event.target===this)closeModal()"><div class="modal card" style="padding:24px">' +
        '<h2 style="font-family:var(--disp);font-size:1.5rem;margin-bottom:12px">' + (id ? 'Edit meal' : 'Upload new meal') + '</h2>' +
        '<div class="preview" id="prev">' + (m.img ? '' : (SVGART[m.kind] || SVGART.generic)) + '</div>' +
        '<div class="field" style="margin-bottom:10px"><label>Upload a photo of the meal</label><input id="dfile" type="file" accept="image/*" onchange="pickImage(this)"></div>' +
        '<div class="field" style="margin-bottom:10px"><label>…or paste an image URL (Cloudinary)</label><input id="durl" value="' + (m.img && !m.img.startsWith("data:") ? m.img : "") + '" placeholder="https://… (optional)" oninput="urlImage(this.value)"></div>' +
        '<div class="field" style="margin-bottom:10px"><label>Name</label><input id="dn" value="' + m.name + '" placeholder="Meal name"></div>' +
        '<div class="grid-2" style="gap:10px;margin-bottom:10px"><div class="field"><label>Category</label><select id="dc">' + CATS.slice(1).map(c => '<option ' + (c === m.cat ? 'selected' : '') + '>' + c + '</option>').join("") + '</select></div>' +
        '<div class="field"><label>Illustration style</label><select id="dk" onchange="kindPreview(this.value)">' + ART_KINDS.map(k => '<option value="' + k + '" ' + (k === m.kind ? 'selected' : '') + '>' + KIND_LBL[k] + '</option>').join("") + '</select></div></div>' +
        '<div class="grid-2" style="gap:10px;margin-bottom:14px"><div class="field"><label>Price (FCFA)</label><input id="dp" type="number" value="' + m.price + '"></div>' +
        '<div class="field"><label>Stock</label><select id="ds">' + ["in", "low", "out"].map(s => '<option value="' + s + '" ' + (s === m.stock ? 'selected' : '') + '>' + (s === 'in' ? 'In stock' : s === 'low' ? 'Low' : 'Sold out') + '</option>').join("") + '</select></div></div>' +
        '<label style="display:flex;align-items:center;gap:8px;font-weight:700;margin-bottom:14px"><input type="checkbox" id="dd" ' + (m.daily ? 'checked' : '') + ' style="width:18px;height:18px;accent-color:var(--mustard)"> Put on today’s daily menu</label>' +
        '<button class="btn" style="width:100%" onclick="saveMeal(\'' + id + '\')">' + (id ? 'Save changes' : 'Upload meal') + '</button>' +
        '<button class="btn ghost sm" style="width:100%;margin-top:8px;box-shadow:none" onclick="closeModal()">Cancel</button></div></div>';
}

function setPreview(html, bg) { const p = $("#prev"); if (!p) return; if (bg) { p.style.backgroundImage = "url('" + bg + "')";
        p.innerHTML = ""; } else { p.style.backgroundImage = "";
        p.innerHTML = html; } }

function pickImage(input) { const f = input.files && input.files[0]; if (!f) return; const r = new FileReader();
    r.onload = e => { _imgData = e.target.result;
        setPreview("", _imgData); };
    r.readAsDataURL(f); }

function urlImage(v) { if (v.trim()) { _imgData = v.trim();
        setPreview("", _imgData); } else { _imgData = "";
        kindPreview(document.getElementById("dk").value); } }

function kindPreview(k) { if (_imgData) return;
    setPreview(SVGART[k] || SVGART.generic); }

function saveMeal(id) {
    const n = (document.getElementById("dn").value || "").trim();
    if (!n) { toast("Name required", "Give the meal a name", "chili"); return; }
    const data = { name: n, cat: document.getElementById("dc").value, price: +document.getElementById("dp").value || 0, kind: document.getElementById("dk").value, img: _imgData, stock: document.getElementById("ds").value, daily: document.getElementById("dd").checked };
    if (id) { Object.assign(S.menu.find(x => x.id === id), data);
        toast("Meal updated", n + ' saved'); } else { S.menu.push(Object.assign({ id: "m" + Date.now(), votes: 0, rSum: 0, rCount: 0 }, data));
        toast("Meal uploaded", n + ' is now on the menu 🍽️'); }
    _imgData = "";
    closeModal();
    save();
    mount();
}

/* ----- manage cooks (admin adds / removes kitchen staff) ----- */
function renderManageCooks() {
    return '<section class="view">' + adminSubnav('manageCooks') + '<span class="eyebrow">Admin Console</span><h1 class="title">Manage cooks</h1>' +
        '<p class="sub">Add or remove kitchen staff. A cook can only sign in to the kitchen with a Staff ID and password you create here.</p>' +
        '<div class="grid-2" style="align-items:start"><div class="card" style="padding:22px">' +
        '<h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:12px">Kitchen staff (' + S.cooks.length + ')</h3>' +
        (S.cooks.length ? S.cooks.map(c => '<div class="cook-row"><div><b>' + c.name + '</b><div class="money" style="color:var(--ink-soft);font-size:.82rem">' + c.staffId + '</div></div>' +
                '<button class="btn sm ghost" style="box-shadow:none" onclick="removeCook(\'' + c.id + '\')">Remove ✕</button></div>').join("") :
            '<div class="empty" style="padding:24px"><div class="em">👩‍🍳</div>No cooks yet — add one.</div>') + '</div>' +
        '<div class="card" style="padding:22px"><h3 style="font-family:var(--disp);font-size:1.3rem;margin-bottom:12px">Add a cook</h3>' +
        '<div class="field" style="margin-bottom:10px"><label>Full name</label><input id="ckn" placeholder="e.g. Chef Bih"></div>' +
        '<div class="field" style="margin-bottom:10px"><label>Staff ID</label><input id="cks" placeholder="e.g. cook-03"></div>' +
        '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="ckp" placeholder="set a password" value="demo1234"></div>' +
        '<button class="btn green" style="width:100%" onclick="addCook()">+ Add cook to system</button></div></div></section>';
}

function addCook() {
    const name = (document.getElementById("ckn").value || "").trim();
    const sid = (document.getElementById("cks").value || "").trim();
    const pw = (document.getElementById("ckp").value || "").trim();
    if (!name || !sid || !pw) { toast("Missing details", "Name, Staff ID and password are required", "chili"); return; }
    if (S.cooks.some(c => c.staffId === sid)) { toast("Staff ID taken", "Choose a different Staff ID", "chili"); return; }
    S.cooks.push({ id: "c" + Date.now(), name, staffId: sid, pass: pw });
    save();
    mount();
    toast("Cook added", name + " can now sign in as " + sid);
}

function removeCook(id) {
    const c = S.cooks.find(x => x.id === id);
    S.cooks = S.cooks.filter(x => x.id !== id);
    if (S.staff && S.staff.id === id) S.staff = null;
    save();
    mount();
    toast("Cook removed", (c ? c.name : "Cook") + " can no longer sign in", "chili");
}