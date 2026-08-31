"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
/**
 * Get Combined All-Zones Analytics Report
 */
router.get('/combined', async (req, res) => {
    try {
        const grievances = await db_1.prisma.grievance.findMany();
        const total = grievances.length;
        const submitted = grievances.filter(g => g.status === 'SUBMITTED').length;
        const inProgress = grievances.filter(g => g.status === 'IN_PROGRESS').length;
        const resolved = grievances.filter(g => g.status === 'RESOLVED').length;
        const rejected = grievances.filter(g => g.status === 'REJECTED').length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
        return res.json({
            reportType: 'COMBINED_ALL_ZONES',
            totalGrievances: total,
            openCount: submitted + inProgress,
            submittedCount: submitted,
            inProgressCount: inProgress,
            resolvedCount: resolved,
            rejectedCount: rejected,
            resolutionRate
        });
    }
    catch (err) {
        console.error('Error fetching combined analytics:', err);
        return res.status(500).json({ error: err.message });
    }
});
/**
 * Get Zonal Analytics
 */
router.get('/zone/:zoneCode', async (req, res) => {
    try {
        const { zoneCode } = req.params;
        const zone = await db_1.prisma.zone.findUnique({
            where: { code: zoneCode.toUpperCase() }
        });
        if (!zone) {
            return res.status(404).json({ error: 'Zone not found' });
        }
        const grievances = await db_1.prisma.grievance.findMany({
            where: { zoneId: zone.id }
        });
        const total = grievances.length;
        const submitted = grievances.filter(g => g.status === 'SUBMITTED').length;
        const inProgress = grievances.filter(g => g.status === 'IN_PROGRESS').length;
        const resolved = grievances.filter(g => g.status === 'RESOLVED').length;
        const rejected = grievances.filter(g => g.status === 'REJECTED').length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
        return res.json({
            zoneCode: zoneCode.toUpperCase(),
            totalGrievances: total,
            openCount: submitted + inProgress,
            submittedCount: submitted,
            inProgressCount: inProgress,
            resolvedCount: resolved,
            rejectedCount: rejected,
            resolutionRate
        });
    }
    catch (err) {
        console.error('Error fetching zone analytics:', err);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
