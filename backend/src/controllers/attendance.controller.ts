import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, date } = req.query;

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId as string;
    } else if (req.user?.role === 'INTERN') {
      whereClause.userId = req.user.id;
    }

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    const records = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, jobTitle: true } }
      },
      orderBy: { date: 'desc' }
    });

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
};

export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingToday = await prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existingToday) {
      return res.status(400).json({ error: 'You have already checked in today.' });
    }

    const record = await prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        checkInTime: new Date(),
        status: 'PRESENT'
      }
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check in.' });
  }
};

export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const record = await prisma.attendance.findFirst({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (!record) {
      return res.status(400).json({ error: 'No active check-in found for today.' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(record.checkInTime);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOutTime,
        totalHours
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check out.' });
  }
};
