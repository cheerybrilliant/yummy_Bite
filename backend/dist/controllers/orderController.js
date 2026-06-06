"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getStudentOrders = exports.getOrderById = exports.getAllOrders = exports.placeOrder = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const placeOrder = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one item is required' });
        }
        let totalAmount = 0;
        const menuByDishId = new Map();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        for (const item of items) {
            const dailyMenu = await prisma_1.default.dailyMenu.findFirst({
                where: {
                    dishId: item.dishId,
                    isActive: true,
                    date: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                include: { dish: true },
            });
            if (!dailyMenu) {
                return res.status(400).json({ message: 'Dish is not available today' });
            }
            if (dailyMenu.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${dailyMenu.dish.name}` });
            }
            totalAmount += dailyMenu.dish.price * item.quantity;
            menuByDishId.set(item.dishId, {
                quantity: dailyMenu.quantity,
                price: dailyMenu.dish.price,
                name: dailyMenu.dish.name,
            });
        }
        const order = await prisma_1.default.order.create({
            data: {
                student: { connect: { id: studentId } },
                totalAmount,
                status: 'PENDING_PAYMENT',
                items: {
                    create: items.map((item) => ({
                        dish: { connect: { id: item.dishId } },
                        quantity: item.quantity,
                        price: menuByDishId.get(item.dishId)?.price ?? 0,
                    })),
                },
            },
            include: { items: true },
        });
        await prisma_1.default.transactionLog.create({
            data: {
                orderId: order.id,
                userId: studentId,
                action: 'ORDER_PLACED',
                note: 'Student placed order',
            },
        });
        for (const item of items) {
            await prisma_1.default.dailyMenu.updateMany({
                where: {
                    dishId: item.dishId,
                    isActive: true,
                    date: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                data: { quantity: { decrement: item.quantity } },
            });
        }
        res.status(201).json({
            message: 'Order placed successfully',
            orderId: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.placeOrder = placeOrder;
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                student: { select: { id: true, name: true, email: true, phone: true } },
                items: { include: { dish: { select: { id: true, name: true, price: true } } } },
                payment: true,
                logs: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, name: true, email: true, phone: true } },
                items: { include: { dish: { select: { id: true, name: true, price: true } } } },
                payment: true,
                receipt: true,
                logs: true,
            },
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getOrderById = getOrderById;
const getStudentOrders = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const orders = await prisma_1.default.order.findMany({
            where: { studentId },
            include: {
                items: { include: { dish: { select: { id: true, name: true, price: true } } } },
                payment: true,
                receipt: true,
                logs: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getStudentOrders = getStudentOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const existing = await prisma_1.default.order.findUnique({
            where: { id },
            include: { payment: true },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (req.user.role === 'STUDENT') {
            if (!existing || existing.studentId !== req.user.id || status !== 'COMPLETED' || existing.status !== 'READY_FOR_COLLECTION') {
                return res.status(403).json({ message: 'You do not have permission to update this order' });
            }
        }
        else {
            if (status === 'PREPARING' && existing.status !== 'PAYMENT_CONFIRMED') {
                return res.status(400).json({ message: 'Payment must be confirmed before cooking starts' });
            }
            if (status === 'READY_FOR_COLLECTION' && existing.status !== 'PREPARING') {
                return res.status(400).json({ message: 'Order must be preparing before it can be marked ready' });
            }
        }
        const order = await prisma_1.default.order.update({
            where: { id },
            data: { status },
        });
        if (status === 'COMPLETED') {
            const existingReceipt = await prisma_1.default.receipt.findUnique({
                where: { orderId: id },
            });
            if (!existingReceipt) {
                await prisma_1.default.receipt.create({
                    data: { order: { connect: { id } } },
                });
            }
        }
        await prisma_1.default.transactionLog.create({
            data: {
                orderId: id,
                userId: req.user.id,
                action: status,
                note: status === 'READY_FOR_COLLECTION' ? 'Food is ready for pickup' : status === 'COMPLETED' ? 'Student received order' : 'Order status updated',
            },
        });
        res.json({ message: 'Order status updated', order });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.updateOrderStatus = updateOrderStatus;
