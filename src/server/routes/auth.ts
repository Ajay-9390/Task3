import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';

// Extend Express Session interface
declare module 'express-session' {
  interface SessionData {
    officialUser?: any;
  }
}

/**
 * Citizen Register (JWT)
 */
router.post('/citizen/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, zoneCode } = req.body;

    if (!email || !password || !fullName || !zoneCode) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    let zone = await prisma.zone.findUnique({ where: { code: zoneCode.toUpperCase() } });
    if (!zone) {
      zone = await prisma.zone.findFirst({ where: { code: 'KHAIRATABAD' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-citizen-${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        fullName,
        phone,
        role: 'ROLE_CITIZEN',
        zoneId: zone!.id
      },
      include: { zone: true }
    });

    const token = jwt.sign(
      { sub: user.email, email: user.email, role: user.role, zoneCode: zone!.code },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      type: 'Bearer',
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      zoneCode: zone!.code,
      zoneId: zone!.id
    });
  } catch (err: any) {
    console.error('Error in citizen register:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Citizen Login (JWT)
 */
router.post('/citizen/login', async (req: Request, res: Response) => {
  try {
    const { email, password, zoneCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { zone: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: user.email, email: user.email, role: user.role, zoneCode: user.zone.code },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      type: 'Bearer',
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      zoneCode: user.zone.code,
      zoneId: user.zone.id
    });
  } catch (err: any) {
    console.error('Error in citizen login:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Official Login (Session)
 */
router.post('/official/login', async (req: Request, res: Response) => {
  try {
    const { email, password, zoneCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { zone: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid official credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
  } catch (err: any) {
    console.error('Error in official login:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Official Logout
 */
router.post('/official/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session' });
    }
    res.clearCookie('connect.sid');
    return res.send('Logged out official session successfully');
  });
});

export default router;
