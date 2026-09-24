import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getDashboardReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isIntern = req.user?.role === 'INTERN';
    const userId = req.user!.id;

    // Total & Active Interns
    const totalInterns = await prisma.user.count({ where: { role: 'INTERN' } });
    const activeInterns = await prisma.user.count({ where: { role: 'INTERN', status: 'ACTIVE' } });

    // Projects
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({ where: { status: 'ACTIVE' } });

    // Tasks summary
    const taskWhere = isIntern ? { assignments: { some: { userId } } } : {};
    const totalTasks = await prisma.task.count({ where: taskWhere });
    const completedTasks = await prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } });
    const inProgressTasks = await prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } });
    const pendingReviewTasks = await prisma.task.count({ where: { ...taskWhere, status: 'SUBMITTED' } });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskWhere,
        status: { notIn: ['COMPLETED'] },
        dueDate: { lt: now }
      }
    });

    // Recent Progress Updates
    const recentProgress = await prisma.progressUpdate.findMany({
      where: isIntern ? { userId } : {},
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { title: true } }
      }
    });

    // Upcoming Events
    const upcomingEvents = await prisma.event.findMany({
      where: { startDate: { gte: now } },
      take: 5,
      orderBy: { startDate: 'asc' },
      include: { creator: { select: { name: true } } }
    });

    // Attendance stats
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const todayAttendanceCount = await prisma.attendance.count({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    return res.json({
      interns: { total: totalInterns, active: activeInterns },
      projects: { total: totalProjects, active: activeProjects },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pendingReview: pendingReviewTasks,
        overdue: overdueTasks
      },
      todayAttendanceCount,
      recentProgress,
      upcomingEvents
    });
  } catch (error) {
    console.error('Error getting dashboard reports:', error);
    return res.status(500).json({ error: 'Failed to generate dashboard reports.' });
  }
};
