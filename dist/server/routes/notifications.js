"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
/**
 * Get User Notifications
 */
router.get('/', async (req, res) => {
    try {
        let email = 'citizen.ravi@gmail.com';
        let role = 'ROLE_CITIZEN';
        // Check session
        if (req.session && req.session.officialUser) {
            email = req.session.officialUser.email;
            role = req.session.officialUser.role;
        }
        else {
            // Check Bearer JWT token
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.substring(7);
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    if (decoded && decoded.email) {
                        email = decoded.email;
                        role = decoded.role;
                    }
                }
                catch (e) { }
            }
        }
        const notifications = await db_1.prisma.notification.findMany({
            where: {
                OR: [
                    { recipientEmail: email },
                    { recipientRole: role }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(notifications);
    }
    catch (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
