"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByOrder = exports.verifyPayment = exports.submitPayment = exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const uploadDir = path_1.default.join('uploads', 'payments');
fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
exports.upload = (0, multer_1.default)({ storage });
const submitPayment = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { orderId, transactionId } = req.body;
        const screenshot = req.file?.path;
        if (!orderId || !transactionId) {
            return res.status(400).json({ message: 'Order ID and transaction ID are required' });
        }
        if (!screenshot) {
            return res.status(400).json({ message: 'Payment screenshot is required' });
        }
        const order = await prisma_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!order || order.studentId !== studentId) {
            return res.status(403).json({ message: 'Invalid order' });
        }
        const existingPayment = await prisma_1.default.payment.findUnique({
            where: { orderId },
        });
        if (existingPayment && existingPayment.status !== 'REJECTED') {
            return res.status(400).json({ message: 'Payment proof has already been submitted for this order' });
        }
        const payment = existingPayment
            ? await prisma_1.default.payment.update({
                where: { id: existingPayment.id },
                data: {
                    screenshot,
                    transactionId,
                    status: 'PENDING',
                    rejectedReason: null,
                },
            })
            : await prisma_1.default.payment.create({
                data: {
                    orderId,
                    screenshot,
                    transactionId,
                    status: 'PENDING',
                },
            });
        await prisma_1.default.order.update({
            where: { id: orderId },
            data: { status: 'AWAITING_VERIFICATION' },
        });
        await prisma_1.default.transactionLog.create({
            data: {
                orderId,
                userId: studentId,
                action: existingPayment ? 'PAYMENT_RESUBMITTED' : 'PAYMENT_SUBMITTED',
                note: `Student uploaded MoMo proof with transaction ID ${transactionId}`,
            },
        });
        res.status(201).json({
            message: 'Payment screenshot submitted successfully',
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.submitPayment = submitPayment;
const verifyPayment = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { status, rejectedReason } = req.body;
        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Status must be VERIFIED or REJECTED' });
        }
        if (status === 'REJECTED' && !rejectedReason) {
            return res.status(400).json({ message: 'Rejected payments need a reason' });
        }
        const payment = await prisma_1.default.payment.update({
            where: { id },
            data: { status, rejectedReason },
        });
        const orderStatus = status === 'VERIFIED' ? 'PAYMENT_CONFIRMED' : 'PENDING_PAYMENT';
        await prisma_1.default.order.update({
            where: { id: payment.orderId },
            data: { status: orderStatus },
        });
        await prisma_1.default.transactionLog.create({
            data: {
                orderId: payment.orderId,
                userId: req.user.id,
                action: status === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
                note: status === 'VERIFIED' ? 'Staff verified payment' : (rejectedReason || 'Staff rejected payment'),
            },
        });
        res.json({
            message: `Payment ${status.toLowerCase()}`,
            payment,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.verifyPayment = verifyPayment;
const getPaymentByOrder = async (req, res) => {
    try {
        const orderId = String(req.params.orderId);
        const payment = await prisma_1.default.payment.findUnique({
            where: { orderId },
        });
        res.json(payment);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getPaymentByOrder = getPaymentByOrder;
