import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, jobTitle, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'INTERN';

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: userRole,
        status: 'ACTIVE',
        onlineStatus: 'ONLINE',
        jobTitle: jobTitle || (userRole === 'ADMIN' ? 'Engineering Manager' : 'Software Engineer Intern'),
        profile: {
          create: {
            department: department || (userRole === 'ADMIN' ? 'Engineering Management' : 'General Guild')
          }
        }
      },
      include: { profile: true }
    });

    const token = generateToken({
      userId: user.id,
      role: user.role as 'ADMIN' | 'INTERN',
      email: user.email
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Account is inactive. Please contact your admin.' });
    }

    // Update online status to ONLINE
    await prisma.user.update({
      where: { id: user.id },
      data: { onlineStatus: 'ONLINE' }
    });

    const token = generateToken({
      userId: user.id,
      role: user.role as 'ADMIN' | 'INTERN',
      email: user.email
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { onlineStatus: 'OFFLINE' }
      });
    }

    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error during logout.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        teamMembers: {
          include: { team: true }
        },
        projectMembers: {
          include: { project: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.json({ message: 'If that email exists, reset instructions have been dispatched.' });
    }

    const resetToken = Buffer.from(`${user.id}_${Date.now()}`).toString('base64');
    return res.json({
      message: 'Password reset token generated.',
      resetToken,
      info: 'In production, this is emailed. Use resetToken to complete password reset.'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error.' });
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
    const [userId] = decoded.split('_');

    if (!userId) {
      return res.status(400).json({ error: 'Invalid reset token.' });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    return res.json({ message: 'Password reset successfully. You may now log in.' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error during password reset.' });
  }
};
