"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
/**
 * Get All Active GHMC Zones
 */
router.get('/', async (req, res) => {
    try {
        const zones = await db_1.prisma.zone.findMany({
            orderBy: { name: 'asc' }
        });
        return res.json(zones);
    }
    catch (err) {
        console.error('Error fetching zones:', err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
