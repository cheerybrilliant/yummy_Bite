"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSuggestion = exports.getSuggestions = exports.createSuggestion = exports.confirmMenu = exports.getVoteResults = exports.submitVote = exports.getCurrentBallot = exports.createBallot = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
function currentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const day = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;
    return `${now.getFullYear()}-W${Math.ceil(day / 7)}`;
}
const createBallot = async (req, res) => {
    try {
        const { week } = req.body;
        await prisma_1.default.ballot.updateMany({
            where: { isOpen: true },
            data: { isOpen: false },
        });
        const ballot = await prisma_1.default.ballot.upsert({
            where: { week },
            update: { isOpen: true },
            create: { week, isOpen: true },
        });
        res.status(201).json({ message: 'Ballot created successfully', ballot });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createBallot = createBallot;
const getCurrentBallot = async (req, res) => {
    try {
        let ballot = await prisma_1.default.ballot.findFirst({
            where: { isOpen: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!ballot) {
            ballot = await prisma_1.default.ballot.create({
                data: { week: currentWeek(), isOpen: true },
            });
        }
        res.status(200).json({ ballot });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCurrentBallot = getCurrentBallot;
const createSuggestion = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { name, description } = req.body;
        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({ message: 'Meal name is required' });
        }
        const openBallot = await prisma_1.default.ballot.findFirst({
            where: { isOpen: true },
            orderBy: { createdAt: 'desc' },
        });
        const week = openBallot?.week || currentWeek();
        const suggestion = await prisma_1.default.mealSuggestion.create({
            data: {
                name: String(name).trim(),
                description: description || '',
                week,
                suggestedById: studentId,
            },
        });
        res.status(201).json({ message: 'Suggestion submitted', suggestion });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createSuggestion = createSuggestion;
const getSuggestions = async (req, res) => {
    try {
        const status = req.query.status;
        const week = req.query.week;
        const where = {};
        if (status)
            where.status = String(status);
        if (week)
            where.week = String(week);
        const suggestions = await prisma_1.default.mealSuggestion.findMany({
            where,
            include: {
                suggestedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ suggestions });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSuggestions = getSuggestions;
const reviewSuggestion = async (req, res) => {
    try {
        const { status, staffNote } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
        }
        const suggestion = await prisma_1.default.mealSuggestion.update({
            where: { id: req.params.id },
            data: {
                status,
                staffNote: staffNote || '',
                approvedById: req.user.id,
                reviewedAt: new Date(),
            },
        });
        res.status(200).json({ message: 'Suggestion reviewed', suggestion });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.reviewSuggestion = reviewSuggestion;
const submitVote = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { dishIds } = req.body;
        if (!Array.isArray(dishIds) || dishIds.length < 1 || dishIds.length > 3) {
            res.status(400).json({ message: 'You must vote for 1 to 3 dishes' });
            return;
        }
        const openBallot = await prisma_1.default.ballot.findFirst({
            where: { isOpen: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!openBallot) {
            res.status(400).json({ message: 'No active ballot available' });
            return;
        }
        const existingVotes = await prisma_1.default.vote.findFirst({
            where: {
                studentId,
                week: openBallot.week,
            },
        });
        if (existingVotes) {
            res.status(400).json({ message: 'You have already voted this week' });
            return;
        }
        await prisma_1.default.vote.createMany({
            data: dishIds.map((dishId) => ({
                studentId,
                dishId,
                week: openBallot.week,
                count: 1,
            })),
        });
        res.status(201).json({ message: 'Vote submitted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.submitVote = submitVote;
const getVoteResults = async (req, res) => {
    try {
        const weekFromQuery = req.query.week;
        const openBallot = await prisma_1.default.ballot.findFirst({
            where: { isOpen: true },
            orderBy: { createdAt: 'desc' },
        });
        const week = weekFromQuery ?? openBallot?.week;
        if (!week) {
            res.status(400).json({ message: 'No week provided and no active ballot found' });
            return;
        }
        const grouped = await prisma_1.default.vote.groupBy({
            by: ['dishId'],
            where: { week },
            _sum: { count: true },
            orderBy: { _sum: { count: 'desc' } },
        });
        const dishIds = grouped.map((row) => row.dishId);
        const dishes = await prisma_1.default.dish.findMany({
            where: { id: { in: dishIds } },
            select: { id: true, name: true },
        });
        const dishMap = new Map(dishes.map((dish) => [dish.id, dish.name]));
        const results = grouped.map((row) => ({
            dishId: row.dishId,
            dishName: dishMap.get(row.dishId) ?? 'Unknown Dish',
            votes: row._sum.count ?? 0,
        }));
        res.status(200).json({ week, results });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getVoteResults = getVoteResults;
const confirmMenu = async (req, res) => {
    try {
        const { week } = req.body;
        const where = week ? { week } : { isOpen: true };
        const updated = await prisma_1.default.ballot.updateMany({
            where,
            data: { isOpen: false },
        });
        if (updated.count === 0) {
            res.status(404).json({ message: 'No matching ballot found' });
            return;
        }
        res.status(200).json({ message: 'Menu confirmed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.confirmMenu = confirmMenu;
