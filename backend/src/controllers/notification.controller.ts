import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false }
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notification.' });
  }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true }
    });
    return res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark all notifications.' });
  }
};
