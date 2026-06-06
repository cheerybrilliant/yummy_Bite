/* auth.js - separated sign-in and student signup */
function setLoginRole(r) {
    S.loginRole = r;
    save();
    mount();
}

function roleCard(r, t, d) {
    return '<button class="role-card" onclick="setLoginRole(\'' + r + '\')"><span class="rc-ic">' + t + '</span><b>' + t + '</b><span class="rc-d">' + d + '</span></button>';
}

function renderLogin() {
    const role = S.loginRole;
    if (!role) {
        return '<section class="view">' + studentSubnav('login') +
            '<span class="eyebrow">Sign in</span><h1 class="title">Choose your account type</h1>' +
            '<p class="sub">Login and signup are separate. Students can create accounts; cooks are created by admin.</p>' +
            '<div class="role-cards">' +
            roleCard('student', 'Student', 'Browse the menu, order food, pay and rate your meals.') +
            roleCard('cook', 'Cook', 'Run the kitchen order board and approve meal suggestions.') +
            roleCard('admin', 'Admin', 'Manage the menu, cooks, voting and analytics.') +
            '</div><div style="margin-top:18px"><button class="btn" onclick="nav(\'register\')">Create student account</button></div></section>';
    }

    const back = '<button class="chip" onclick="setLoginRole(null)">Back to roles</button>';
    if (role === 'student') {
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<div class="login-grid"><div class="login-art">' +
            '<div><span class="eyebrow" style="color:var(--mustard)">Student access</span><h2>Order. Pay.<br>Track.</h2>' +
            '<p>Use the email and password you registered with.</p></div></div>' +
            '<div class="login-form"><div class="field"><label>Email</label><input id="le" type="email" placeholder="you@ictuniversity.edu.cm"></div>' +
            '<div class="field"><label>Password</label><input id="lp" type="password" placeholder="Your password"></div>' +
            '<button class="btn" style="margin-top:6px" onclick="studentLogin()">Log in</button>' +
            '<p class="cred-note">No account yet? <button class="link-btn" onclick="nav(\'register\')">Create one</button>.</p></div></div></section>';
    }

    if (role === 'cook') {
        return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
            '<span class="eyebrow">Cook / Staff access</span><h1 class="title">Kitchen sign-in</h1>' +
            '<p class="sub">Enter the Staff ID created by admin, or your full staff email.</p>' +
            '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Staff ID or email</label><input id="cid" placeholder="cook-01"></div>' +
            '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="cpw" type="password" placeholder="Your password"></div>' +
            '<button class="btn green" style="width:100%" onclick="cookLogin()">Enter kitchen</button></div></section>';
    }

    return '<section class="view">' + studentSubnav('login') + '<div style="margin-bottom:12px">' + back + '</div>' +
        '<span class="eyebrow">Admin access</span><h1 class="title">Admin sign-in</h1>' +
        '<p class="sub">Restricted area. Use your admin email and password.</p>' +
        '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Admin email</label><input id="aid" type="email" placeholder="admin@ictuniversity.edu.cm"></div>' +
        '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="apw" type="password" placeholder="Your password"></div>' +
        '<button class="btn dark" style="width:100%" onclick="adminLogin()">Enter admin console</button></div></section>';
}

function renderRegister() {
    return '<section class="view">' + studentSubnav('login') +
        '<button class="chip" onclick="nav(\'login\')">Back to login</button>' +
        '<span class="eyebrow" style="display:block;margin-top:14px">Student signup</span><h1 class="title">Create your account</h1>' +
        '<p class="sub">Create a real student account. You will use these details for future orders.</p>' +
        '<div class="card auth-card"><div class="field" style="margin-bottom:10px"><label>Full name</label><input id="rn" placeholder="e.g. Ngono Pauline"></div>' +
        '<div class="field" style="margin-bottom:10px"><label>Email</label><input id="re" type="email" placeholder="you@ictuniversity.edu.cm"></div>' +
        '<div class="field" style="margin-bottom:10px"><label>Phone</label><input id="rp" placeholder="6 70 00 00 00"></div>' +
        '<div class="field" style="margin-bottom:14px"><label>Password</label><input id="rpass" type="password" placeholder="At least 6 characters"></div>' +
        '<button class="btn" style="width:100%" onclick="studentSignup()">Create account</button></div></section>';
}

function requireValue(id, label) {
    const value = (document.getElementById(id).value || "").trim();
    if (!value) throw new Error(label + " is required");
    return value;
}

async function studentLogin() {
    try {
        const email = requireValue("le", "Email");
        const password = requireValue("lp", "Password");
        const session = await apiJson("/api/auth/login", "POST", { email, password });
        if (session.user.role !== "STUDENT") throw new Error("This account is not a student account");
        setAuthSession(session);
        requestReadyNotifications();
        await syncFromApi();
        save();
        nav('menu');
    } catch (e) {
        toast("Sign-in failed", e.message, "chili");
    }
}

async function studentSignup() {
    try {
        const name = requireValue("rn", "Full name");
        const email = requireValue("re", "Email");
        const phone = (document.getElementById("rp").value || "").trim();
        const password = requireValue("rpass", "Password");
        await apiJson("/api/auth/register", "POST", { name, email, password, phone });
        const session = await apiJson("/api/auth/login", "POST", { email, password });
        setAuthSession(session);
        requestReadyNotifications();
        await syncFromApi();
        save();
        nav('menu');
    } catch (e) {
        toast("Signup failed", e.message, "chili");
    }
}

function requestReadyNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
    }
}

async function cookLogin() {
    try {
        const id = requireValue("cid", "Staff ID or email");
        const password = requireValue("cpw", "Password");
        const email = id.includes("@") ? id : id + "@ictuniversity.edu.cm";
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
    try {
        const email = requireValue("aid", "Admin email");
        const password = requireValue("apw", "Password");
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
