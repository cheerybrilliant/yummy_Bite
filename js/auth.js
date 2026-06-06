/* auth.js - role-aware sign-in for Student / Cook / Admin */
function setLoginRole(r) {
    S.loginRole = r;
    save();
    mount();
}

function setAuthTab(t) {
    S.authTab = t;
    save();
    mount();
}

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
            roleCard('student', 'Student', 'Student', 'Browse the menu, order food, pay and rate your meals.') +
            roleCard('cook', 'Cook', 'Cook / Staff', 'Run the kitchen order board and upload daily meals.') +
            roleCard('admin', 'Admin', 'Admin', 'Manage the menu, cooks, voting and analytics.') +
            '</div></section>';
    }

    const back = '<button class="chip" onclick="setLoginRole(null)">Back to roles</button>';

    if (role === 'student') {
        const t = S.authTab || 'login';
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<div class="login-grid"><div class="login-art">' +
            '<div class="blob" style="width:160px;height:160px;background:var(--chili);top:-30px;right:-30px"></div>' +
            '<div class="blob" style="width:120px;height:120px;background:var(--mustard);bottom:30px;left:-20px;opacity:.5"></div>' +
            '<div><span class="eyebrow" style="color:var(--mustard)">Student access</span><h2>Order. Pay.<br>Chop.</h2>' +
            '<p>Sign in to see prices and place your order from the campus canteen.</p></div>' +
            '<div style="position:relative;color:#e7dcc7;font-size:.85rem;font-weight:600">Members-only pricing and ordering</div></div>' +
            '<div class="login-form"><div class="tabs">' +
            '<button class="' + (t === 'login' ? 'on' : '') + '" onclick="setAuthTab(\'login\')">Log in</button>' +
            '<button class="' + (t === 'register' ? 'on' : '') + '" onclick="setAuthTab(\'register\')">Register</button></div>' +
            (t === 'register' ? '<div class="field"><label>Full name</label><input id="rn" placeholder="e.g. Ngono Pauline"></div>' : '') +
            '<div class="field"><label>Email</label><input id="le" placeholder="student@ictuniversity.edu.cm" value="' + (t === 'login' ? 'student@ictuniversity.edu.cm' : '') + '"></div>' +
            '<div class="field"><label>Password</label><input id="lp" type="password" value="demo1234"></div>' +
            '<button class="btn" style="margin-top:6px" onclick="studentLogin(' + (t === 'register') + ')">' + (t === 'login' ? 'Log in' : 'Create account') + '</button>' +
            '<p class="cred-note">Demo login: student@ictuniversity.edu.cm / demo1234.</p></div></div></section>';
    }

    if (role === 'cook') {
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<span class="eyebrow">Cook / Staff access</span><h1 class="title">Kitchen sign-in</h1>' +
            '<p class="sub">Cooks are created by the admin. Enter the Staff ID and password you were given.</p>' +
            '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Staff ID</label><input id="cid" placeholder="cook-01" value="cook-01"></div>' +
            '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="cpw" type="password" value="demo1234"></div>' +
            '<button class="btn green" style="width:100%" onclick="cookLogin()">Enter kitchen</button>' +
            '<p class="cred-note">Demo cook: cook-01 / demo1234.</p></div></section>';
    }

    return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
        '<span class="eyebrow">Admin access</span><h1 class="title">Admin sign-in</h1>' +
        '<p class="sub">Restricted area. Sign in to manage the menu, cooks and analytics.</p>' +
        '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Admin email</label><input id="aid" value="admin@ictuniversity.edu.cm"></div>' +
        '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="apw" type="password" value="demo1234"></div>' +
        '<button class="btn dark" style="width:100%" onclick="adminLogin()">Enter admin console</button>' +
        '<p class="cred-note">Demo admin: admin@ictuniversity.edu.cm / demo1234.</p></div></section>';
}

async function studentLogin(isRegister) {
    const name = isRegister ? ((document.getElementById("rn") && document.getElementById("rn").value) || "New Student") : "Demo Student";
    const email = (document.getElementById("le").value || "").trim() || "student@ictuniversity.edu.cm";
    const password = (document.getElementById("lp").value || "").trim() || "demo1234";
    try {
        if (isRegister) {
            await apiJson("/api/auth/register", "POST", { name, email, password, phone: "", role: "STUDENT" });
        }
        const session = await apiJson("/api/auth/login", "POST", { email, password });
        if (session.user.role !== "STUDENT") throw new Error("This account is not a student account");
        setAuthSession(session);
        await syncFromApi();
        save();
        nav('menu');
    } catch (e) {
        toast("Sign-in failed", e.message, "chili");
    }
}

async function cookLogin() {
    const id = (document.getElementById("cid").value || "").trim() || "cook-01";
    const password = (document.getElementById("cpw").value || "").trim() || "demo1234";
    const email = id.includes("@") ? id : id + "@ictuniversity.edu.cm";
    try {
        const session = await apiJson("/api/auth/login", "POST", { email, password });
        if (session.user.role !== "STAFF") throw new Error("This account is not a staff account");
        setAuthSession(session);
        await syncFromApi();
        save();
        nav('dashboard');
    } catch (e) {
        toast("Sign-in failed", e.message, "chili");
    }
}

async function adminLogin() {
    const email = (document.getElementById("aid").value || "").trim();
    const password = (document.getElementById("apw").value || "").trim();
    if (!email || !password) {
        toast("Sign-in failed", "Enter your admin details", "chili");
        return;
    }
    try {
        const session = await apiJson("/api/auth/login", "POST", { email, password });
        if (session.user.role !== "ADMIN") throw new Error("This account is not an admin account");
        setAuthSession(session);
        await syncFromApi();
        save();
        nav('adminMenu');
    } catch (e) {
        toast("Sign-in failed", e.message, "chili");
    }
}
