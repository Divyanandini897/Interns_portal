import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId, projectId, startDate, endDate } = req.query;

    const whereClause: any = {};
    if (teamId) whereClause.teamId = teamId as string;
    if (projectId) whereClause.projectId = projectId as string;

    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        team: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, location, meetingLink, teamId, projectId, participantIds } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required.' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        meetingLink,
        teamId,
        projectId,
        creatorId: req.user!.id,
        participants: {
          create: participantIds?.map((userId: string) => ({ userId })) || [{ userId: req.user!.id }]
        }
      },
      include: {
        creator: { select: { id: true, name: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });

    if (participantIds && Array.isArray(participantIds)) {
      await prisma.notification.createMany({
        data: participantIds
          .filter(uid => uid !== req.user!.id)
          .map((userId: string) => ({
            userId,
            title: 'New Calendar Event',
            message: `Event "${title}" scheduled for ${new Date(startDate).toLocaleDateString()}.`,
            type: 'EVENT',
            linkUrl: '/calendar'
          }))
      });
    }

    return res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.event.delete({ where: { id } });
    return res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
};
