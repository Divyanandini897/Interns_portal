import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';
import { hashPassword } from '../utils/password';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, status, search } = req.query;

    const whereClause: any = {};
    if (role) whereClause.role = role as string;
    if (status) whereClause.status = status as string;
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { jobTitle: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        teamMembers: { include: { team: true } },
        projectMembers: { include: { project: true } },
        _count: {
          select: {
            assignedTasks: true,
            progressUpdates: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const safeUsers = users.map(({ passwordHash, ...user }) => user);
    return res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        teamMembers: { include: { team: true } },
        projectMembers: { include: { project: true } },
        assignedTasks: { include: { task: true } },
        attendances: { take: 10, orderBy: { date: 'desc' } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};

export const createIntern = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, jobTitle, department, bio, phone, skills, githubUrl, linkedinUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: 'INTERN',
        status: 'ACTIVE',
        jobTitle: jobTitle || 'Software Engineer Intern',
        profile: {
          create: {
            department,
            bio,
            phone,
            skills,
            githubUrl,
            linkedinUrl
          }
        }
      },
      include: { profile: true }
    });

    const { passwordHash, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating intern:', error);
    return res.status(500).json({ error: 'Failed to create intern user.' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, jobTitle, avatarUrl, bio, phone, department, skills, githubUrl, linkedinUrl } = req.body;

    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Forbidden. You can only update your own profile.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        jobTitle,
        avatarUrl,
        profile: {
          upsert: {
            create: { bio, phone, department, skills, githubUrl, linkedinUrl },
            update: { bio, phone, department, skills, githubUrl, linkedinUrl }
          }
        }
      },
      include: { profile: true }
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile.' });
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid user status value.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    return res.json({ message: `Status updated to ${status}`, userId: user.id, status: user.status });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update status.' });
  }
};
