"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const dailyMenuRoutes_1 = __importDefault(require("./routes/dailyMenuRoutes"));
const dishRoutes_1 = __importDefault(require("./routes/dishRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const receiptRoutes_1 = __importDefault(require("./routes/receiptRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const voteRoutes_1 = __importDefault(require("./routes/voteRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5050;
const ROOT_DIR = process.cwd();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
app.use(express_1.default.static(ROOT_DIR));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(ROOT_DIR, 'home.html'));
});
app.get('/api/health', (req, res) => {
    res.json({ message: 'Yummy Bite API is running' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/dishes', dishRoutes_1.default);
app.use('/api/daily-menu', dailyMenuRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/receipts', receiptRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/votes', voteRoutes_1.default);
async function main() {
    try {
        await prisma_1.default.$connect();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
main();
exports.default = app;
