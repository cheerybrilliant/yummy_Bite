"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', settingsController_1.getSettings);
router.put('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('ADMIN'), settingsController_1.updateSettings);
exports.default = router;
