/* auth.js — role-asking sign-in (Student / Cook / Admin) */
function setLoginRole(r) { S.loginRole = r;
    save();
    mount(); }

function setAuthTab(t) { S.authTab = t;
    save();
    mount(); }

function roleCard(r, ic, t, d) {
    return '<button class="role-card" onclick="setLoginRole(\'' + r + '\')"><span class="rc-ic">' + ic + '</span><b>' + t + '</b><span class="rc-d">' + d + '</span></button>';
}

function renderLogin() {
    const role = S.loginRole;
    if (!role) {
        return '<section class="view">' + studentSubnav('login') +
            '<span class="eyebrow">Sign in</span><h1 class="title">Who are you?</h1>' +
            '<p class="sub">Choose your role to continue. Each role signs in with its own details.</p>' +
            '<div class="role-cards">' +
            roleCard('student', '🎓', 'Student', 'Browse the menu, order food, pay and rate your meals.') +
            roleCard('cook', '👩‍🍳', 'Cook / Staff', 'Run the kitchen order board and upload daily meals.') +
            roleCard('admin', '🛠️', 'Admin', 'Manage the menu, add or remove cooks, view analytics.') +
            '</div></section>';
    }
    const back = '<button class="chip" onclick="setLoginRole(null)">← Choose a different role</button>';

    if (role === 'student') {
        const t = S.authTab || 'login';
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<div class="login-grid"><div class="login-art">' +
            '<div class="blob" style="width:160px;height:160px;background:var(--chili);top:-30px;right:-30px"></div>' +
            '<div class="blob" style="width:120px;height:120px;background:var(--mustard);bottom:30px;left:-20px;opacity:.5"></div>' +
            '<div><span class="eyebrow" style="color:var(--mustard)">Student access</span><h2>Order. Pay.<br>Chop.</h2>' +
            '<p>Sign in to see prices and place your order from the campus canteen.</p></div>' +
            '<div style="position:relative;color:#e7dcc7;font-size:.85rem;font-weight:600">🔒 Members-only pricing & ordering</div></div>' +
            '<div class="login-form"><div class="tabs">' +
            '<button class="' + (t === 'login' ? 'on' : '') + '" onclick="setAuthTab(\'login\')">Log in</button>' +
            '<button class="' + (t === 'register' ? 'on' : '') + '" onclick="setAuthTab(\'register\')">Register</button></div>' +
            (t === 'register' ? '<div class="field"><label>Full name</label><input id="rn" placeholder="e.g. Ngono Pauline"></div>' : '') +
            '<div class="field"><label>Matric / Email</label><input id="le" placeholder="you@ictuniversity.edu.cm"></div>' +
            '<div class="field"><label>Password</label><input type="password" value="demo1234"></div>' +
            '<button class="btn" style="margin-top:6px" onclick="studentLogin(' + (t === 'register') + ')">' + (t === 'login' ? 'Log in' : 'Create account') + ' →</button>' +
            '<p class="cred-note">Demo — any details work.</p></div></div></section>';
    }

    if (role === 'cook') {
        const ids = S.cooks.map(c => c.staffId).join(', ');
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<span class="eyebrow">Cook / Staff access</span><h1 class="title">Kitchen sign-in</h1>' +
            '<p class="sub">Cooks are created by the admin. Enter the Staff ID and password you were given.</p>' +
            '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Staff ID</label><input id="cid" placeholder="cook-01"></div>' +
            '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="cpw" type="password" placeholder="••••••••"></div>' +
            '<button class="btn green" style="width:100%" onclick="cookLogin()">Enter kitchen →</button>' +
            '<p class="cred-note">Demo cooks: ' + (ids || 'none yet — ask admin') + ' · password demo1234</p></div></section>';
    }

    // admin
    return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
        '<span class="eyebrow">Admin access</span><h1 class="title">Admin sign-in</h1>' +
        '<p class="sub">Restricted area. Sign in to manage the menu, cooks and analytics.</p>' +
        '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Admin email</label><input id="aid" placeholder="admin@ictuniversity.edu.cm" value="admin@ictuniversity.edu.cm"></div>' +
        '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="apw" type="password" value="demo1234"></div>' +
        '<button class="btn dark" style="width:100%" onclick="adminLogin()">Enter admin console →</button>' +
        '<p class="cred-note">Demo — any details work.</p></div></section>';
}

function studentLogin(isRegister) {
    const name = isRegister ? ((document.getElementById("rn") && document.getElementById("rn").value) || "New Student") : "Demo Student";
    S.user = { name };
    S.staff = null;
    S.admin = false;
    S.loginRole = null;
    save();
    nav('menu');
}

function cookLogin() {
    const id = (document.getElementById("cid").value || "").trim();
    const pw = (document.getElementById("cpw").value || "").trim();
    const cook = S.cooks.find(c => c.staffId === id && c.pass === pw);
    if (!cook) { toast("Sign-in failed", "Invalid Staff ID or password", "chili"); return; }
    S.staff = { name: cook.name, id: cook.id };
    S.user = null;
    S.admin = false;
    S.loginRole = null;
    save();
    nav('dashboard');
}

function adminLogin() {
    const email = (document.getElementById("aid").value || "").trim();
    const pw = (document.getElementById("apw").value || "").trim();
    if (!email || !pw) { toast("Sign-in failed", "Enter your admin details", "chili"); return; }
    S.admin = true;
    S.user = null;
    S.staff = null;
    S.loginRole = null;
    save();
    nav('adminMenu');
}