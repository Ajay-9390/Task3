import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * Get All Active GHMC Zones
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(zones);
  } catch (err: any) {
    console.error('Error fetching zones:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
