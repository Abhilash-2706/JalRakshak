import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const port = 5000;
const JWT_SECRET = 'jalrakshak_secret_2026';

app.use(cors());
app.use(express.json());

// ─── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Required fields missing' });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hash, phone } });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Incorrect password' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────

app.get('/api/complaints', async (_req: any, res: any) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        citizen: { select: { name: true } },
        assignedOfficer: { select: { name: true } },
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/complaints', async (req: any, res: any) => {
  try {
    const { leakType, leakCategory, severity, description, latitude, longitude, address, area, city, pincode, citizenId, isAnonymous, isEmergency } = req.body;
    const count = await prisma.complaint.count();
    const complaintId = `JL-2026-${String(count + 1).padStart(6, '0')}`;
    const priority = severity === 'Critical' ? 'CRITICAL' : severity === 'High' ? 'HIGH' : severity === 'Medium' ? 'MEDIUM' : 'LOW';
    const complaint = await prisma.complaint.create({
      data: { complaintId, citizenId: citizenId || null, leakType, leakCategory, severity, priority, description, latitude: parseFloat(latitude) || 12.9716, longitude: parseFloat(longitude) || 77.5946, address: address || 'Unknown', area, city, pincode, isAnonymous: !!isAnonymous, isEmergency: !!isEmergency },
    });
    // Log status history
    await prisma.statusHistory.create({ data: { complaintId: complaint.id, status: 'SUBMITTED', notes: 'Complaint submitted' } });
    res.status(201).json(complaint);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/complaints/:id', async (req: any, res: any) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId: req.params.id },
      include: { citizen: { select: { name: true } }, assignedOfficer: { select: { name: true } }, statusHistory: { orderBy: { createdAt: 'asc' } }, feedback: true },
    });
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    res.json(complaint);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/complaints/:id/status', async (req: any, res: any) => {
  try {
    const { status, notes } = req.body;
    const complaint = await prisma.complaint.update({ where: { complaintId: req.params.id }, data: { status } });
    await prisma.statusHistory.create({ data: { complaintId: complaint.id, status, notes: notes || '' } });
    res.json(complaint);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

app.post('/api/complaints/:id/feedback', async (req: any, res: any) => {
  try {
    const { rating, isRepaired, isSatisfactory, comments } = req.body;
    const complaint = await prisma.complaint.findUnique({ where: { complaintId: req.params.id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    const existing = await prisma.feedback.findUnique({ where: { complaintId: complaint.id } });
    if (existing) return res.status(400).json({ error: 'Feedback already submitted' });
    const fb = await prisma.feedback.create({ data: { complaintId: complaint.id, rating: parseInt(rating), isRepaired: !!isRepaired, isSatisfactory: !!isSatisfactory, comments } });
    res.json(fb);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── USERS ────────────────────────────────────────────────────────────────────

app.get('/api/users', async (_req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── STATS ────────────────────────────────────────────────────────────────────

app.get('/api/stats', async (_req: any, res: any) => {
  try {
    const total = await prisma.complaint.count();
    const critical = await prisma.complaint.count({ where: { priority: 'CRITICAL' } });
    const resolved = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
    const active = await prisma.complaint.count({ where: { status: { notIn: ['RESOLVED', 'REJECTED'] } } });
    const underReview = await prisma.complaint.count({ where: { status: 'UNDER_REVIEW' } });
    res.json({ total, critical, resolved, active, underReview, waterSaved: resolved * 4500 });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

app.get('/api/notifications/:userId', async (req: any, res: any) => {
  try {
    const notifs = await prisma.notification.findMany({ where: { userId: req.params.userId }, orderBy: { createdAt: 'desc' } });
    res.json(notifs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/notifications/:id/read', async (req: any, res: any) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`✅ JalRakshak Backend running at http://localhost:${port}`);
});
