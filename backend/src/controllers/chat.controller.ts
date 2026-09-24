import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';

export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userTeams = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true }
    });
    const teamIds = userTeams.map(t => t.teamId);

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
          { teamId: { in: teamIds } }
        ]
      },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } },
        team: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        files: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, teamId, title } = req.body;
    const userId = req.user!.id;

    if (recipientId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          OR: [
            { participant1Id: userId, participant2Id: recipientId },
            { participant1Id: recipientId, participant2Id: userId }
          ]
        },
        include: {
          participant1: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } },
          participant2: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } }
        }
      });

      if (existing) return res.json(existing);

      const conv = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participant1Id: userId,
          participant2Id: recipientId
        },
        include: {
          participant1: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } },
          participant2: { select: { id: true, name: true, avatarUrl: true, onlineStatus: true } }
        }
      });

      return res.status(201).json(conv);
    } else if (teamId) {
      const conv = await prisma.conversation.create({
        data: {
          type: 'TEAM',
          teamId,
          title: title || 'Team Channel'
        },
        include: { team: true }
      });
      return res.status(201).json(conv);
    }

    return res.status(400).json({ error: 'Recipient ID or Team ID required.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create conversation.' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId, content, files } = req.body;
    const senderId = req.user!.id;

    if (!content && (!files || files.length === 0)) {
      return res.status(400).json({ error: 'Message content or files required.' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content || '',
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
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        files: true
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};
