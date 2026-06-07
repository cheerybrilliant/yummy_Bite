"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.createStaff = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-this-secret';
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const rawEmail = String(email || '').trim();
        const normalizedEmail = rawEmail.toLowerCase();
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const existingUser = await prisma_1.default.user.findFirst({
            where: { OR: [{ email: normalizedEmail }, { email: rawEmail }] },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: String(name).trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: String(phone || '').trim(),
                role: 'STUDENT',
            },
        });
        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.register = register;
const createStaff = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const rawEmail = String(email || '').trim();
        const normalizedEmail = rawEmail.toLowerCase();
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const existingUser = await prisma_1.default.user.findFirst({
            where: { OR: [{ email: normalizedEmail }, { email: rawEmail }] },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: String(name).trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: String(phone || '').trim(),
                role: 'STAFF',
            },
        });
        res.status(201).json({
            message: 'Staff account created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.createStaff = createStaff;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const rawEmail = String(email || '').trim();
        const normalizedEmail = rawEmail.toLowerCase();
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await prisma_1.default.user.findFirst({
            where: { OR: [{ email: normalizedEmail }, { email: rawEmail }] },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.login = login;
const listStaff = async (req, res) => {
    try {
        const staff = await prisma_1.default.user.findMany({
            where: { role: 'STAFF' },
            select: { id: true, name: true, email: true, phone: true, createdAt: true }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.listStaff = listStaff;
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user || user.role !== 'STAFF') {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        await prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'Staff member deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.deleteStaff = deleteStaff;
