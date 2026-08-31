import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { broadcastNotification } from '../websocket';
import { upload } from '../middleware/upload';

const ALLOWED_STATUSES = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';

// Helper middleware to extract user from JWT or Session
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { email: decoded.email, role: decoded.role, zoneCode: decoded.zoneCode };
    } catch (e) {
      // Invalid token
    }
  }

  if (req.session && req.session.officialUser) {
    return req.session.officialUser;
  }

  return null;
}

/**
 * File Upload Endpoint (Single Photo Upload)
 */
router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }
    const publicUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: publicUrl, filename: req.file.filename });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

/**
 * Submit a Grievance (Citizen) with Before Photo URL
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    const citizenEmail = authUser ? authUser.email : 'citizen.ravi@gmail.com';

    const citizen = await prisma.user.findUnique({
      where: { email: citizenEmail },
      include: { zone: true }
    });

    if (!citizen) {
      return res.status(404).json({ error: 'Citizen user not found' });
    }

    const { title, category, description, location, wardNo, zoneCode, beforePhotoUrl } = req.body;

    let zone = citizen.zone;
    if (zoneCode) {
      const z = await prisma.zone.findUnique({ where: { code: zoneCode.toUpperCase() } });
      if (z) zone = z;
    }

    const grievanceId = `grv-${Date.now()}`;

    const grievance = await prisma.grievance.create({
      data: {
        id: grievanceId,
        title,
        category: category.toUpperCase(),
        description,
        status: 'SUBMITTED',
        location,
        wardNo: wardNo || 'Ward 91',
        beforePhotoUrl: beforePhotoUrl || null,
        afterPhotoUrl: null,
        citizenId: citizen.id,
        zoneId: zone.id
      },
      include: {
        citizen: true,
        zone: true
      }
    });

    // Create Notification
    const notifId = `ntf-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        recipientRole: 'ROLE_CITIZEN',
        recipientEmail: citizen.email,
        zoneCode: zone.code,
        title: '🚨 Grievance Acknowledged',
        message: `Your civic complaint '${title}' (ID: ${grievanceId}) has been logged in ${zone.name}.`,
        type: 'NEW_GRIEVANCE',
        grievanceId,
        readStatus: false
      }
    });

    // Broadcast real-time notification via WebSocket
    broadcastNotification({
      type: 'NEW_GRIEVANCE',
      grievanceId,
      title: '🚨 New Grievance Filed',
      message: `New ${category} grievance submitted in ${zone.code} (${wardNo}).`
    });

    return res.json(grievance);
  } catch (err: any) {
    console.error('Error creating grievance:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit grievance' });
  }
});

/**
 * Get Grievances Scoped to Active Zone (via X-Zone-Id header)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const zoneHeader = req.headers['x-zone-id'] as string;
    let zoneCode = zoneHeader || 'KHAIRATABAD';

    const zone = await prisma.zone.findFirst({
      where: {
        OR: [
          { code: zoneCode.toUpperCase() },
          { id: zoneCode }
        ]
      }
    });

    if (!zone) {
      return res.json([]);
    }

    const grievances = await prisma.grievance.findMany({
      where: { zoneId: zone.id },
      include: {
        citizen: true,
        zone: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(grievances);
  } catch (err: any) {
    console.error('Error fetching zone grievances:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Get Citizen's Own Submitted Grievances
 */
router.get('/my', async (req: Request, res: Response) => {
  try {
    const authUser = getAuthUser(req);
    const email = authUser ? authUser.email : 'citizen.ravi@gmail.com';

    const citizen = await prisma.user.findUnique({ where: { email } });
    if (!citizen) {
      return res.json([]);
    }

    const grievances = await prisma.grievance.findMany({
      where: { citizenId: citizen.id },
      include: {
        citizen: true,
        zone: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(grievances);
  } catch (err: any) {
    console.error('Error fetching citizen grievances:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Update Grievance Status with After Photo Proof (Ward Inspector action)
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, afterPhotoUrl } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid grievance status' });
    }

    const updateData: any = { status };
    if (afterPhotoUrl) {
      updateData.afterPhotoUrl = afterPhotoUrl;
    }

    const updated = await prisma.grievance.update({
      where: { id },
      data: updateData,
      include: {
        citizen: true,
        zone: true
      }
    });

    // Create Notification
    const notifId = `ntf-status-${Date.now()}`;
    await prisma.notification.create({
      data: {
        id: notifId,
        recipientRole: 'ROLE_CITIZEN',
        recipientEmail: updated.citizen.email,
        zoneCode: updated.zone.code,
        title: status === 'RESOLVED' ? '✅ Grievance Resolved' : 'ℹ️ Status Updated',
        message: `Your complaint '${updated.title}' (ID: ${updated.id}) status changed to ${status}.`,
        type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_UPDATED',
        grievanceId: updated.id,
        readStatus: false
      }
    });

    broadcastNotification({
      type: status === 'RESOLVED' ? 'RESOLVED' : 'STATUS_UPDATED',
      grievanceId: updated.id,
      title: `Grievance Status: ${status}`,
      message: `Complaint ${updated.id} in ${updated.zone.code} updated to ${status}.`
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating status:', err);
    return res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

export default router;
