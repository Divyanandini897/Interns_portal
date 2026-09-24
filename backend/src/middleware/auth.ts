import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    id: string;
    name: string;
    status: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Your account is currently inactive.' });
    }

    req.user = {
      id: user.id,
      userId: user.id,
      role: user.role as 'ADMIN' | 'INTERN',
      email: user.email,
      name: user.name,
      status: user.status
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (...roles: Array<'ADMIN' | 'INTERN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};
