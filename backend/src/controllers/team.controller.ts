import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true, jobTitle: true, status: true, onlineStatus: true } }
          }
        },
        projects: { select: { id: true, name: true, status: true } },
        _count: { select: { members: true, projects: true } }
      }
    });

    return res.json(teams);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch teams.' });
  }
};

export const getTeamById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true, avatarUrl: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true, jobTitle: true, status: true, onlineStatus: true } }
          }
        },
        projects: true
      }
    });

    if (!team) return res.status(404).json({ error: 'Team not found.' });
    return res.json(team);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch team.' });
  }
};

export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, managerId, memberIds } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required.' });

    const team = await prisma.team.create({
      data: {
        name,
        description,
        managerId: managerId || req.user?.id,
        members: {
          create: memberIds?.map((userId: string) => ({ userId, role: 'MEMBER' })) || []
        }
      },
      include: {
        manager: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    await prisma.conversation.create({
      data: {
        type: 'TEAM',
        title: `${name} General`,
        teamId: team.id
      }
    });

    return res.status(201).json(team);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create team.' });
  }
};

export const updateTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, managerId } = req.body;

    const team = await prisma.team.update({
      where: { id },
      data: { name, description, managerId }
    });

    return res.json(team);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update team.' });
  }
};

export const addTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId, role } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required.' });

    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId,
        role: role || 'MEMBER'
      },
      include: { user: true }
    });

    return res.status(201).json(member);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add team member.' });
  }
};

export const removeTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.params.userId as string;
    await prisma.teamMember.deleteMany({
      where: { teamId: id, userId }
    });
    return res.json({ message: 'Member removed from team.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove team member.' });
  }
};
