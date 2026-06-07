"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceipt = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getReceipt = async (req, res) => {
    try {
        const orderId = String(req.params.orderId);
        const receipt = await prisma_1.default.receipt.findUnique({
            where: { orderId },
            include: {
                order: {
                    include: {
                        student: { select: { name: true, email: true, phone: true } },
                        items: {
                            include: { dish: { select: { name: true, price: true } } },
                        },
                    },
                },
            },
        });
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.json(receipt);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getReceipt = getReceipt;
