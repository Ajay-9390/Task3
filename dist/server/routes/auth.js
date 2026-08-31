"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
/**
 * Citizen Register (JWT)
 */
router.post('/citizen/register', async (req, res) => {
    try {
        const { email, password, fullName, phone, zoneCode } = req.body;
        if (!email || !password || !fullName || !zoneCode) {
            return res.status(400).json({ error: 'Missing required registration fields' });
        }
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        let zone = await db_1.prisma.zone.findUnique({ where: { code: zoneCode.toUpperCase() } });
        if (!zone) {
            zone = await db_1.prisma.zone.findFirst({ where: { code: 'KHAIRATABAD' } });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = `user-citizen-${Date.now()}`;
        const user = await db_1.prisma.user.create({
            data: {
                id: userId,
                email,
                password: hashedPassword,
                fullName,
                phone,
                role: 'ROLE_CITIZEN',
                zoneId: zone.id
            },
            include: { zone: true }
        });
        const token = jsonwebtoken_1.default.sign({ sub: user.email, email: user.email, role: user.role, zoneCode: zone.code }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            token,
            type: 'Bearer',
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            zoneCode: zone.code,
            zoneId: zone.id
        });
    }
    catch (err) {
        console.error('Error in citizen register:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
/**
 * Citizen Login (JWT)
 */
router.post('/citizen/login', async (req, res) => {
    try {
        const { email, password, zoneCode } = req.body;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: { zone: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.email, email: user.email, role: user.role, zoneCode: user.zone.code }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            token,
            type: 'Bearer',
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            zoneCode: user.zone.code,
            zoneId: user.zone.id
        });
    }
    catch (err) {
        console.error('Error in citizen login:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
/**
 * Official Login (Session)
 */
router.post('/official/login', async (req, res) => {
    try {
        const { email, password, zoneCode } = req.body;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: { zone: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid official credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid official credentials' });
        }
        // Attach to session
        req.session.officialUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            zoneCode: user.zone.code,
            assignedWard: user.assignedWard
        };
        return res.json({
            token: null,
            type: 'Session',
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            zoneCode: user.zone.code,
            zoneId: user.zone.id,
            assignedWard: user.assignedWard
        });
    }
    catch (err) {
        console.error('Error in official login:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
});
/**
 * Official Logout
 */
router.post('/official/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to destroy session' });
        }
        res.clearCookie('connect.sid');
        return res.send('Logged out official session successfully');
    });
});
exports.default = router;
