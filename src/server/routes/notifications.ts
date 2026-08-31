import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';

/**
 * Get User Notifications
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let email = 'citizen.ravi@gmail.com';
    let role = 'ROLE_CITIZEN';

    // Check session
    if (req.session && req.session.officialUser) {
      email = req.session.officialUser.email;
      role = req.session.officialUser.role;
    } else {
      // Check Bearer JWT token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded && decoded.email) {
            email = decoded.email;
            role = decoded.role;
          }
        } catch (e) {}
      }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { recipientEmail: email },
          { recipientRole: role }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(notifications);
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
