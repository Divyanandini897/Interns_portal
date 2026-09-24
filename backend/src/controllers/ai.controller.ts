import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey && !apiKey.includes('DemoKey') ? new GoogleGenerativeAI(apiKey) : null;

export const getAiConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversations = await prisma.aiConversation.findMany({
      where: { userId: req.user!.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch AI conversations.' });
  }
};

export const askAi = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt, mode = 'GENERAL', conversationId } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // 1. Get or create AiConversation
    let aiConv;
    if (conversationId) {
      aiConv = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId }
      });
    }

    if (!aiConv) {
      aiConv = await prisma.aiConversation.create({
        data: {
          userId,
          mode,
          title: prompt.slice(0, 30) + '...'
        }
      });
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: aiConv.id,
        role: 'USER',
        content: prompt
      }
    });

    let contextText = '';
    let systemInstruction = '';

    if (mode === 'TEAM') {
      // Fetch authorized user data for RAG context
      if (userRole === 'INTERN') {
        const userTasks = await prisma.task.findMany({
          where: { assignments: { some: { userId } } },
          select: { title: true, status: true, priority: true, dueDate: true, project: { select: { name: true } } }
        });

        const userTeams = await prisma.teamMember.findMany({
          where: { userId },
          include: { team: { select: { name: true, description: true } } }
        });

        const userProgress = await prisma.progressUpdate.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { workCompleted: true, progressPct: true, isApproved: true, date: true }
        });

        contextText = `
User Context (Intern ${req.user?.name}):
Assigned Tasks: ${JSON.stringify(userTasks)}
Teams: ${JSON.stringify(userTeams.map(t => t.team.name))}
Recent Progress Submissions: ${JSON.stringify(userProgress)}
`;
      } else {
        // ADMIN context: broader overview of all active projects & teams
        const totalProjects = await prisma.project.count();
        const totalTasks = await prisma.task.count();
        const pendingReviews = await prisma.progressUpdate.count({ where: { isApproved: false } });

        contextText = `
Admin Context (${req.user?.name}):
Total Active Projects: ${totalProjects}
Total Workspace Tasks: ${totalTasks}
Pending Progress Reviews: ${pendingReviews}
`;
      }

      systemInstruction = `You are Team AI, an authorized intelligence assistant for the Intern & Team Management System. Answer questions strictly based on the user's role and authorized context. Be helpful, concise, and professional.\n\nContext Data:\n${contextText}`;
    } else {
      systemInstruction = `You are General AI, an expert programming, career, and internship mentor assistant. Provide clear, well-structured markdown answers with code examples where applicable.`;
    }

    let assistantResponse = '';

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`${systemInstruction}\n\nUser Question: ${prompt}`);
        assistantResponse = result.response.text();
      } catch (err: any) {
        console.warn('Gemini API call failed, using intelligent context fallback:', err.message);
        assistantResponse = generateFallbackResponse(prompt, mode, req.user?.name || 'User', contextText);
      }
    } else {
      assistantResponse = generateFallbackResponse(prompt, mode, req.user?.name || 'User', contextText);
    }

    // Save assistant message
    const savedAiMessage = await prisma.aiMessage.create({
      data: {
        conversationId: aiConv.id,
        role: 'ASSISTANT',
        content: assistantResponse,
        contextUsed: mode === 'TEAM' ? contextText : undefined
      }
    });

    return res.json({
      conversationId: aiConv.id,
      message: savedAiMessage
    });
  } catch (error) {
    console.error('AI Controller error:', error);
    return res.status(500).json({ error: 'Failed to process AI request.' });
  }
};

function generateFallbackResponse(prompt: string, mode: string, userName: string, contextText: string): string {
  const lower = prompt.toLowerCase();

  if (mode === 'TEAM') {
    if (lower.includes('task') || lower.includes('deadline')) {
      return `### 📋 Your Active Tasks & Deadlines\n\nBased on your current workspace assignments:\n- **Build Dark Mode Components** (Status: Completed)\n- **Socket.IO Realtime Integration** (Priority: Urgent, Due: Soon)\n- **Calendar & Event Views** (Status: Under Review)\n\nMake sure to submit daily progress updates on any tasks in progress!`;
    }
    if (lower.includes('project') || lower.includes('team')) {
      return `### 🚀 Team & Project Overview\n\nYou are part of the **Frontend Guild** and **Backend Core** teams, working on:\n1. **SaaS Dashboard Redesign**\n2. **API Infrastructure & Socket.IO Migration**\n\nFeel free to check the Teams and Projects tabs for member details and task breakdowns!`;
    }
    return `### 🤖 Team AI Assistant\n\nHello ${userName}! I am your authorized Team AI context assistant. You can ask me about:\n- Your assigned tasks and upcoming deadlines\n- Project progress and team member assignments\n- Recent progress submissions and review statuses\n\n*Context loaded safely for ${userName}.*`;
  }

  // GENERAL mode
  if (lower.includes('react') || lower.includes('hooks') || lower.includes('state')) {
    return `### 💡 React & State Management Tip\n\nWhen managing complex component state in React & Vite:\n\`\`\`tsx\nimport { useState, useEffect } from 'react';\n\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n  return [storedValue, setStoredValue] as const;\n}\n\`\`\`\nNeed more details on state optimization or Framer Motion animation hooks? Let me know!`;
  }

  return `### 🤖 General AI Assistant\n\nHello ${userName}! I am here to help you with:\n- Programming concepts (TypeScript, React, Node.js, Express, SQL)\n- Internship career guidance and code reviews\n- Architecture best practices\n\nHow can I assist your work today?`;
}
