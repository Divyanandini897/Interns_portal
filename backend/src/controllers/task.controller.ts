import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, projectId, assigneeId } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status as string;
    if (priority) whereClause.priority = priority as string;
    if (projectId) whereClause.projectId = projectId as string;

    if (assigneeId) {
      whereClause.assignments = {
        some: { userId: assigneeId as string }
      };
    } else if (req.user?.role === 'INTERN') {
      whereClause.assignments = {
        some: { userId: req.user.id }
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } }
          }
        },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { files: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignments: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            reviewer: { select: { id: true, name: true } },
            files: true
          }
        }
      }
    });

    if (!task) return res.status(404).json({ error: 'Task not found.' });
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch task.' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, projectId, assigneeIds } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required.' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: 'NOT_STARTED',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId,
        creatorId: req.user!.id,
        assignments: {
          create: assigneeIds?.map((userId: string) => ({ userId })) || []
        }
      },
      include: {
        project: true,
        assignments: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });

    if (assigneeIds && Array.isArray(assigneeIds)) {
      await prisma.notification.createMany({
        data: assigneeIds.map((userId: string) => ({
          userId,
          title: 'New Task Assigned',
          message: `You have been assigned to task: "${title}".`,
          type: 'TASK_ASSIGN',
          linkUrl: '/tasks'
        }))
      });
    }

    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid task status.' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: { assignments: true, creator: true }
    });

    if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') {
      await prisma.notification.create({
        data: {
          userId: task.creatorId,
          title: 'Task Work Submitted',
          message: `${req.user?.name} updated task status to ${status}: "${task.title}".`,
          type: 'WORK_REVIEW',
          linkUrl: '/tasks'
        }
      });
    } else if (status === 'COMPLETED') {
      await prisma.notification.createMany({
        data: task.assignments.map((a: any) => ({
          userId: a.userId,
          title: 'Task Approved & Completed',
          message: `Task "${task.title}" has been marked COMPLETED.`,
          type: 'WORK_REVIEW',
          linkUrl: '/tasks'
        }))
      });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task status.' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, status, priority, dueDate, projectId, assigneeIds } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId
      }
    });

    if (assigneeIds && Array.isArray(assigneeIds)) {
      await prisma.taskAssignment.deleteMany({ where: { taskId: id } });
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((userId: string) => ({ taskId: id, userId }))
      });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};
