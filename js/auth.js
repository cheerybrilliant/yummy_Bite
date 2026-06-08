/* Login and signup page behavior. */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-role-choice]").forEach(button => {
        button.addEventListener("click", () => showLoginRole(button.dataset.roleChoice));
    });
    document.querySelectorAll("[data-back-roles]").forEach(button => {
        button.addEventListener("click", showRoleChoices);
    });

    const studentLogin = document.getElementById("studentLoginForm");
    const staffLogin = document.getElementById("staffLoginForm");
    const adminLogin = document.getElementById("adminLoginForm");
    const register = document.getElementById("registerForm");

    if (studentLogin) studentLogin.addEventListener("submit", event => login(event, "STUDENT", "menu"));
    if (staffLogin) staffLogin.addEventListener("submit", event => login(event, "STAFF", "dashboard"));
    if (adminLogin) adminLogin.addEventListener("submit", event => login(event, "ADMIN", "adminMenu"));
    if (register) register.addEventListener("submit", signup);
});

function showLoginRole(role) {
    const choiceGrid = document.getElementById("roleChoiceGrid");
    if (choiceGrid) choiceGrid.hidden = true;

    ["student", "cook", "admin"].forEach(name => {
        const panel = document.getElementById(name + "Panel");
        if (panel) panel.hidden = name !== role;
    });
}

function showRoleChoices() {
    const choiceGrid = document.getElementById("roleChoiceGrid");
    if (choiceGrid) choiceGrid.hidden = false;

    ["student", "cook", "admin"].forEach(name => {
        const panel = document.getElementById(name + "Panel");
        if (panel) panel.hidden = true;
    });
}

async function login(event, expectedRole, destination) {
    event.preventDefault();
    const form = event.currentTarget;
    let email = form.email.value.trim().toLowerCase();
    const password = form.password.value.trim();
    if (form.staffId && !email) {
        const staffId = form.staffId.value.trim();
        email = (staffId.includes("@") ? staffId : staffId + "@ictuniversity.edu.cm").toLowerCase();
    }
    if (!email || !password) {
        App.notice("Missing details", "Email and password are required", "error");
        return;
    }
    try {
        const session = await App.apiJson("/api/auth/login", "POST", { email, password });
        if (session.user.role !== expectedRole) throw new Error("This is not a " + expectedRole.toLowerCase() + " account");
        App.setSession(session);
        App.nav(destination);
    } catch (error) {
        App.notice("Login failed", error.message, "error");
    }
}

async function signup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        phone: form.phone.value.trim(),
        password: form.password.value.trim()
    };
    if (!payload.name || !payload.email || !payload.password) {
        App.notice("Missing details", "Name, email and password are required", "error");
        return;
    }
    try {
        await App.apiJson("/api/auth/register", "POST", payload);
        const session = await App.apiJson("/api/auth/login", "POST", { email: payload.email, password: payload.password });
        App.setSession(session);
        App.nav("menu");
    } catch (error) {
        App.notice("Signup failed", error.message, "error");
    }
}
