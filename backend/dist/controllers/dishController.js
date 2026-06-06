"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDish = exports.updateDish = exports.getAllDishes = exports.createDish = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createDish = async (req, res) => {
    try {
        const { name, description, price, category, image } = req.body;
        const dish = await prisma_1.default.dish.create({
            data: {
                name,
                description,
                price: Number(price),
                category,
                image,
            },
        });
        res.status(201).json({
            message: 'Dish created successfully',
            dish,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.createDish = createDish;
const getAllDishes = async (req, res) => {
    try {
        const dishes = await prisma_1.default.dish.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(dishes);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getAllDishes = getAllDishes;
const updateDish = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { name, description, price, category, image } = req.body;
        const dish = await prisma_1.default.dish.update({
            where: { id },
            data: {
                name,
                description,
                price: Number(price),
                category,
                image,
            },
        });
        res.json({ message: 'Dish updated', dish });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.updateDish = updateDish;
const deleteDish = async (req, res) => {
    try {
        const id = String(req.params.id);
        await prisma_1.default.dish.delete({ where: { id } });
        res.json({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.deleteDish = deleteDish;
