"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
}
const prisma = new client_1.PrismaClient();
exports.default = prisma;
