"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));

const getSettings = async (req, res) => {
    try {
        const rows = await prisma_1.default.setting.findMany();
        const result = {};
        rows.forEach(r => { result[r.key] = r.value; });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getSettings = getSettings;

const updateSettings = async (req, res) => {
    try {
        const { mtn_number, orange_number } = req.body;
        if (mtn_number !== undefined) {
            await prisma_1.default.setting.upsert({
                where: { key: 'mtn_number' },
                update: { value: String(mtn_number).trim() },
                create: { key: 'mtn_number', value: String(mtn_number).trim() }
            });
        }
        if (orange_number !== undefined) {
            await prisma_1.default.setting.upsert({
                where: { key: 'orange_number' },
                update: { value: String(orange_number).trim() },
                create: { key: 'orange_number', value: String(orange_number).trim() }
            });
        }
        res.json({ message: 'Settings saved' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.updateSettings = updateSettings;
