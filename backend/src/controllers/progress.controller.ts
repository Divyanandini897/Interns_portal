import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getProgressUpdates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, taskId, projectId, teamId, date } = req.query;

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId as string;
    } else if (req.user?.role === 'INTERN') {
      whereClause.userId = req.user.id;
    }

    if (taskId) whereClause.taskId = taskId as string;

    if (projectId) {
      whereClause.task = { projectId: projectId as string };
    }

    if (teamId) {
      whereClause.user = {
        teamMembers: {
          some: { teamId: teamId as string }
        }
      };
    }

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    const updates = await prisma.progressUpdate.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, jobTitle: true } },
        task: { select: { id: true, title: true, status: true, project: { select: { id: true, name: true } } } },
        reviewer: { select: { id: true, name: true } },
        files: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(updates);
  } catch (error) {
    console.error('Error fetching progress updates:', error);
    return res.status(500).json({ error: 'Failed to fetch progress updates.' });
  }
};

export const createProgressUpdate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, date, hoursWorked, progressPct, workCompleted, currentWork, challenges, nextPlan, files } = req.body;

    if (!workCompleted) {
      return res.status(400).json({ error: 'Work completed description is required.' });
    }

    const update = await prisma.progressUpdate.create({
      data: {
        taskId,
        userId: req.user!.id,
        date: date ? new Date(date) : new Date(),
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : 0,
        progressPct: progressPct ? parseInt(progressPct, 10) : 0,
        workCompleted,
        currentWork,
        challenges,
        nextPlan,
        isApproved: false,
        files: files && Array.isArray(files) ? {
          create: files.map((f: any) => ({
            filename: f.filename,
            originalName: f.originalName || f.filename,
            fileUrl: f.fileUrl,
            fileType: f.fileType,
            fileSize: f.fileSize
          }))
        } : undefined
      },
      include: {
        task: true,
        user: { select: { id: true, name: true } },
        files: true
      }
    });

    if (taskId) {
      const newStatus = progressPct >= 100 ? 'SUBMITTED' : 'IN_PROGRESS';
      await prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus }
      });
    }

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'Daily Progress Submitted',
          message: `${req.user?.name} submitted daily progress update (${progressPct || 0}% completed).`,
          type: 'PROGRESS_SUBMIT',
          linkUrl: '/progress'
        }))
      });
    }

    return res.status(201).json(update);
  } catch (error) {
    console.error('Error submitting progress update:', error);
    return res.status(500).json({ error: 'Failed to submit progress update.' });
  }
};

export const reviewProgressUpdate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isApproved, reviewNotes } = req.body;

    const update = await prisma.progressUpdate.update({
      where: { id },
      data: {
        isApproved: Boolean(isApproved),
        reviewNotes,
        reviewerId: req.user!.id
      },
      include: { user: true, task: true }
    });

    if (update.taskId) {
      if (isApproved) {
        await prisma.task.update({
          where: { id: update.taskId },
          data: { status: 'COMPLETED' }
        });
      } else {
        await prisma.task.update({
          where: { id: update.taskId },
          data: { status: 'IN_PROGRESS' }
        });
      }
    }

    await prisma.notification.create({
      data: {
        userId: update.userId,
        title: isApproved ? 'Work Approved 🎉' : 'Changes Requested 📝',
        message: isApproved
          ? `Your progress submission has been approved by ${req.user?.name}.`
          : `Review feedback provided: "${reviewNotes || 'Please check feedback and update.'}"`,
        type: 'WORK_REVIEW',
        linkUrl: '/progress'
      }
    });

    return res.json(update);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to review progress update.' });
  }
};
