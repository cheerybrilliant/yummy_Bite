/* Student home, menu and about behavior. */
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("homeStats")) loadHomeStats();
    if (document.getElementById("menuGrid")) loadStudentMenu();
});

async function loadHomeStats() {
    try {
        const dishes = await App.api("/api/dishes");
        const today = await safeTodayMenu();
        setText("homeDishCount", dishes.length);
        setText("homeTodayCount", today.length);
    } catch (error) {
        App.notice("Could not load home stats", error.message, "error");
    }
}

async function loadStudentMenu() {
    const grid = document.getElementById("menuGrid");
    const template = document.getElementById("dishCardTemplate");
    const search = document.getElementById("dishSearch");
    const category = document.getElementById("dishCategory");
    const empty = document.getElementById("menuEmpty");
    let menu = [];

    try {
        const today = await safeTodayMenu();
        menu = today.map(item => ({
            id: item.dish.id,
            name: item.dish.name,
            description: item.dish.description || "",
            category: item.dish.category,
            price: item.dish.price,
            image: item.dish.image || "",
            quantity: item.quantity
        }));
        draw();
    } catch (error) {
        App.notice("Menu failed to load", error.message, "error");
    }

    if (search) search.addEventListener("input", draw);
    if (category) category.addEventListener("change", draw);

    function draw() {
        const word = (search && search.value || "").toLowerCase();
        const cat = category && category.value || "All";
        const list = menu.filter(dish => {
            const matchesWord = dish.name.toLowerCase().includes(word) || dish.description.toLowerCase().includes(word);
            const matchesCategory = cat === "All" || dish.category === cat;
            return matchesWord && matchesCategory;
        });
        grid.innerHTML = "";
        empty.hidden = list.length > 0;
        list.forEach(dish => {
            const node = template.content.firstElementChild.cloneNode(true);
            const image = node.querySelector("[data-dish-image]");
            if (dish.image) {
                image.src = dish.image;
                image.alt = dish.name;
                image.onerror = () => image.remove();
            } else {
                image.remove();
            }
            node.querySelector("[data-dish-name]").textContent = dish.name;
            node.querySelector("[data-dish-description]").textContent = dish.description || "Fresh canteen meal";
            node.querySelector("[data-dish-category]").textContent = dish.category;
            node.querySelector("[data-dish-price]").textContent = App.user() ? App.money(dish.price) : "Sign in for price";
            node.querySelector("[data-dish-quantity]").textContent = dish.quantity + " left today";
            const button = node.querySelector("[data-add-cart]");
            button.disabled = !App.user();
            button.textContent = App.user() ? "Add to cart" : "Login to order";
            button.addEventListener("click", () => {
                if (!App.user()) return App.nav("login");
                App.addCartItem(dish);
            });
            grid.appendChild(node);
        });
    }
}

async function safeTodayMenu() {
    try {
        return await App.api("/api/daily-menu/today");
    } catch (error) {
        return [];
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
