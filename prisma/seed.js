const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

async function upsertUser({ name, email, password, role, phone }) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role, phone },
    create: { name, email, password: hashed, role, phone },
  });
}

async function main() {
  await upsertUser({
    name: "Demo Student",
    email: "student@ictuniversity.edu.cm",
    password: "demo1234",
    role: "STUDENT",
    phone: "670000000",
  });
  await upsertUser({
    name: "Chef Awah",
    email: "cook-01@ictuniversity.edu.cm",
    password: "demo1234",
    role: "STAFF",
    phone: "670000001",
  });
  await upsertUser({
    name: "Yummy Bite Admin",
    email: "admin@ictuniversity.edu.cm",
    password: "demo1234",
    role: "ADMIN",
    phone: "670000002",
  });

  const dishes = [
    ["Ndole & Plantain", "Greens stew with ripe plantain", 2500, "Mains"],
    ["Jollof Rice + Chicken", "Spiced rice served with chicken", 2000, "Mains"],
    ["Poulet DG", "Chicken, plantain and vegetables", 3000, "Mains"],
    ["Eru & Water Fufu", "Eru soup with water fufu", 2200, "Mains"],
    ["Achu & Yellow Soup", "Achu with yellow soup", 2800, "Soups"],
    ["Fish Pepper Soup", "Hot pepper soup with fish", 2800, "Soups"],
    ["Puff-Puff (x5)", "Five fresh puff-puff balls", 500, "Snacks"],
    ["Beignet-Haricot", "Beignets with beans", 800, "Snacks"],
    ["Folere / Bissap", "Cold hibiscus drink", 600, "Drinks"],
    ["Bottled Water", "Fresh bottled water", 300, "Drinks"],
  ];

  for (const [name, description, price, category] of dishes) {
    await prisma.dish.upsert({
      where: { name },
      update: { description, price, category },
      create: { name, description, price, category },
    });
  }

  const allDishes = await prisma.dish.findMany({ orderBy: { name: "asc" } });
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const existingDaily = await prisma.dailyMenu.count({
    where: { date: { gte: today, lt: tomorrow } },
  });

  if (!existingDaily) {
    await prisma.dailyMenu.createMany({
      data: allDishes.slice(0, 6).map((dish) => ({
        dishId: dish.id,
        date: today,
        quantity: 25,
        isActive: true,
      })),
    });
  }

  const week = `${today.getFullYear()}-W${Math.ceil((((today - new Date(today.getFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
  await prisma.ballot.upsert({
    where: { week },
    update: { isOpen: true },
    create: { week, isOpen: true },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
