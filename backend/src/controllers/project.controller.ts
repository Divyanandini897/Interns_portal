import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        team: true,
        manager: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } }
          }
        },
        tasks: {
          select: { id: true, title: true, status: true, priority: true, dueDate: true }
        },
        _count: { select: { tasks: true, members: true } }
      }
    });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        team: { include: { members: { include: { user: true } } } },
        manager: { select: { id: true, name: true, email: true } },
        members: { include: { user: true } },
        tasks: { include: { assignments: { include: { user: true } } } }
      }
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, status, startDate, dueDate, teamId, managerId, memberIds } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required.' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        teamId,
        managerId: managerId || req.user?.id,
        members: {
          create: memberIds?.map((userId: string) => ({ userId })) || []
        }
      },
      include: {
        team: true,
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create project.' });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, status, startDate, dueDate, teamId, managerId } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        teamId,
        managerId
      }
    });

    return res.json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update project.' });
  }
};
