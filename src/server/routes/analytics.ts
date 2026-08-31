import { Router, Request, Response } from 'express';
import { prisma } from '../db';


const router = Router();

/**
 * Get Combined All-Zones Analytics Report
 */
router.get('/combined', async (req: Request, res: Response) => {
  try {
    const grievances = await prisma.grievance.findMany();

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
  } catch (err: any) {
    console.error('Error fetching combined analytics:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Get Zonal Analytics
 */
router.get('/zone/:zoneCode', async (req: Request, res: Response) => {
  try {
    const { zoneCode } = req.params;

    const zone = await prisma.zone.findUnique({
      where: { code: zoneCode.toUpperCase() }
    });

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const grievances = await prisma.grievance.findMany({
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
  } catch (err: any) {
    console.error('Error fetching zone analytics:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
