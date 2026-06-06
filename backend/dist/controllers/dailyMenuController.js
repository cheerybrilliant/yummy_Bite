"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDailyMenuStock = exports.getTodayMenu = exports.activateDailyMenu = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const activateDailyMenu = async (req, res) => {
    try {
        const { date, items } = req.body;
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(selectedDate);
        nextDate.setDate(selectedDate.getDate() + 1);
        await prisma_1.default.dailyMenu.deleteMany({
            where: {
                date: {
                    gte: selectedDate,
                    lt: nextDate,
                },
            },
        });
        const dailyMenus = await prisma_1.default.$transaction(items.map((item) => prisma_1.default.dailyMenu.create({
            data: {
                date: selectedDate,
                quantity: item.quantity,
                isActive: true,
                dishId: item.dishId,
            },
        })));
        res.status(201).json({
            message: 'Daily menu activated successfully',
            dailyMenus,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.activateDailyMenu = activateDailyMenu;
const getTodayMenu = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const menu = await prisma_1.default.dailyMenu.findMany({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow,
                },
                isActive: true,
                quantity: { gt: 0 },
            },
            include: {
                dish: true,
            },
        });
        res.json(menu);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getTodayMenu = getTodayMenu;
const updateDailyMenuStock = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { quantity, isActive } = req.body;
        const dailyMenu = await prisma_1.default.dailyMenu.update({
            where: { id },
            data: { quantity, isActive },
            include: { dish: true },
        });
        res.json({ message: 'Stock updated', dailyMenu });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.updateDailyMenuStock = updateDailyMenuStock;
