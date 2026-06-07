"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewByOrder = exports.getReviewsByDish = exports.createReview = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createReview = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { orderId, dishId, rating, comment } = req.body;
        if (rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5' });
            return;
        }
        const order = await prisma_1.default.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order || order.studentId !== studentId) {
            res.status(403).json({ message: 'Invalid order for review' });
            return;
        }
        const alreadyReviewed = await prisma_1.default.review.findFirst({ where: { orderId } });
        if (alreadyReviewed) {
            res.status(400).json({ message: 'You have already reviewed this order' });
            return;
        }
        const orderedDish = order.items.some((item) => item.dishId === dishId);
        if (!orderedDish) {
            res.status(400).json({ message: 'Dish was not part of this order' });
            return;
        }
        const review = await prisma_1.default.review.create({
            data: { studentId, orderId, dishId, rating, comment },
        });
        res.status(201).json({ message: 'Review submitted successfully', review });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createReview = createReview;
const getReviewsByDish = async (req, res) => {
    try {
        const dishId = req.params.dishId;
        const reviews = await prisma_1.default.review.findMany({
            where: { dishId },
            include: { student: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ reviews });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getReviewsByDish = getReviewsByDish;
const getReviewByOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const review = await prisma_1.default.review.findFirst({
            where: { orderId },
            include: { student: { select: { id: true, name: true } } },
        });
        if (!review) {
            res.status(404).json({ message: 'No review found for this order' });
            return;
        }
        res.status(200).json({ review });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getReviewByOrder = getReviewByOrder;
