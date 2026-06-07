/* Admin page behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("menuManagementPage")) loadMenuManagement();
    if (document.getElementById("dailyMenuPage")) loadDailyMenuPage();
    if (document.getElementById("votingResultsPage")) loadVotingResults();
    if (document.getElementById("analyticsPage")) loadAnalytics();
    if (document.getElementById("manageCooksPage")) initManageCooks();
});

async function allDishes() {
    return App.api("/api/dishes");
}

async function loadMenuManagement() {
    if (!App.requireRole("ADMIN")) return;
    document.getElementById("dishForm").addEventListener("submit", saveDish);
    document.getElementById("clearDishForm").addEventListener("click", clearDishForm);
    document.getElementById("dishImageFile").addEventListener("change", readDishImage);
    await drawDishTable();
}

async function drawDishTable() {
    const dishes = await allDishes();
    const body = document.getElementById("dishTableBody");
    body.innerHTML = "";
    dishes.forEach(dish => {
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + App.escape(dish.name) + "</td><td>" + App.escape(dish.category) + "</td><td>" + App.money(dish.price) + "</td><td>" + (dish.image ? "Image set" : "No image") + "</td><td><button class='btn sm' type='button'>Edit</button> <button class='btn sm ghost' type='button'>Delete</button></td>";
        row.querySelector(".btn").addEventListener("click", () => fillDishForm(dish));
        row.querySelector(".ghost").addEventListener("click", () => deleteDish(dish.id));
        body.appendChild(row);
    });
}

function fillDishForm(dish) {
    const form = document.getElementById("dishForm");
    form.dishId.value = dish.id;
    form.name.value = dish.name;
    form.description.value = dish.description || "";
    form.category.value = dish.category;
    form.price.value = dish.price;
    form.image.value = dish.image || "";
}

function clearDishForm() {
    document.getElementById("dishForm").reset();
    document.getElementById("dishId").value = "";
}

function readDishImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { document.getElementById("dishImage").value = reader.result; };
    reader.readAsDataURL(file);
}

async function saveDish(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const id = form.dishId.value;
    const body = {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        category: form.category.value,
        price: Number(form.price.value || 0),
        image: form.image.value.trim()
    };
    try {
        await App.apiJson(id ? "/api/dishes/" + id : "/api/dishes", id ? "PUT" : "POST", body, true);
        App.notice("Dish saved", body.name);
        clearDishForm();
        await drawDishTable();
    } catch (error) {
        App.notice("Dish save failed", error.message, "error");
    }
}

async function deleteDish(id) {
    if (!confirm("Delete this dish?")) return;
    try {
        await App.apiJson("/api/dishes/" + id, "DELETE", null, true);
        App.notice("Dish deleted", "Menu updated");
        await drawDishTable();
    } catch (error) {
        App.notice("Delete failed", error.message, "error");
    }
}

async function loadDailyMenuPage() {
    if (!App.requireRole("ADMIN")) return;
    document.getElementById("dailyMenuForm").addEventListener("submit", publishDailyMenu);
    const dishes = await allDishes();
    const today = await App.api("/api/daily-menu/today");
    const active = new Map(today.map(item => [item.dishId, item.quantity]));
    const body = document.getElementById("dailyMenuBody");
    body.innerHTML = "";
    dishes.forEach(dish => {
        const row = document.createElement("tr");
        const quantity = active.get(dish.id) || 25;
        row.innerHTML = "<td><input type='checkbox' name='dishId' value='" + App.escape(dish.id) + "' " + (active.has(dish.id) ? "checked" : "") + "></td><td>" + App.escape(dish.name) + "</td><td>" + App.money(dish.price) + "</td><td><input type='number' min='0' value='" + quantity + "' data-quantity-for='" + App.escape(dish.id) + "'></td>";
        body.appendChild(row);
    });
}

async function publishDailyMenu(event) {
    event.preventDefault();
    const items = Array.from(document.querySelectorAll("input[name='dishId']:checked")).map(input => ({
        dishId: input.value,
        quantity: Number(document.querySelector("[data-quantity-for='" + input.value + "']").value || 0)
    }));
    try {
        await App.apiJson("/api/daily-menu", "POST", { date: new Date().toISOString(), items }, true);
        App.notice("Daily menu published", items.length + " dishes available today");
    } catch (error) {
        App.notice("Publish failed", error.message, "error");
    }
}

async function loadVotingResults() {
    if (!App.requireRole("ADMIN")) return;
    const body = document.getElementById("votingResultsBody");
    try {
        const data = await App.api("/api/votes/results", { headers: App.authHeaders() });
        document.getElementById("voteWeek").textContent = data.week || "Current week";
        body.innerHTML = (data.results || []).map(row => "<tr><td>" + App.escape(row.dishName) + "</td><td>" + row.votes + "</td></tr>").join("");
    } catch (error) {
        App.notice("Voting results failed", error.message, "error");
    }
}

async function loadAnalytics() {
    if (!App.requireRole("ADMIN")) return;
    const orders = await App.api("/api/orders", { headers: App.authHeaders() });
    const dishes = await allDishes();
    const sales = orders.filter(order => ["PAYMENT_CONFIRMED", "PREPARING", "READY_FOR_COLLECTION", "COMPLETED"].includes(order.status)).reduce((sum, order) => sum + order.totalAmount, 0);
    document.getElementById("analyticsSales").textContent = App.money(sales);
    document.getElementById("analyticsOrders").textContent = orders.length;
    document.getElementById("analyticsDishes").textContent = dishes.length;
}

function initManageCooks() {
    if (!App.requireRole("ADMIN")) return;
    document.getElementById("cookForm").addEventListener("submit", createCook);
}

async function createCook(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const staffId = form.staffId.value.trim();
    try {
        await App.apiJson("/api/auth/staff", "POST", {
            name: form.name.value.trim(),
            email: staffId.includes("@") ? staffId : staffId + "@ictuniversity.edu.cm",
            password: form.password.value.trim(),
            phone: form.phone.value.trim()
        }, true);
        form.reset();
        App.notice("Cook created", "Staff can now log in");
    } catch (error) {
        App.notice("Cook creation failed", error.message, "error");
    }
}
