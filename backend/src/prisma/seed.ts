import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing tables
  await prisma.activityLog.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.file.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedInternPassword = await bcrypt.hash('Intern@123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      passwordHash: hashedAdminPassword,
      name: 'Sarah Connor',
      role: 'ADMIN',
      status: 'ACTIVE',
      onlineStatus: 'ONLINE',
      jobTitle: 'Head of Engineering & Internship Director',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      profile: {
        create: {
          bio: 'Lead Engineering Manager orchestrating internship programs and project growth.',
          phone: '+1 (555) 019-2834',
          department: 'Engineering Management',
          skills: 'Engineering Leadership, Architecture, Mentorship, Agile',
          linkedinUrl: 'https://linkedin.com/in/sarah-connor'
        }
      }
    }
  });

  const intern1 = await prisma.user.create({
    data: {
      email: 'intern1@company.com',
      passwordHash: hashedInternPassword,
      name: 'Alex Rivers',
      role: 'INTERN',
      status: 'ACTIVE',
      onlineStatus: 'ONLINE',
      jobTitle: 'Frontend Developer Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      profile: {
        create: {
          bio: 'Passionate computer science student specializing in React, TypeScript & modern UI design.',
          phone: '+1 (555) 234-5678',
          department: 'Frontend Guild',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-12-01'),
          skills: 'React, TypeScript, Tailwind CSS, Framer Motion, HTML5/CSS3',
          githubUrl: 'https://github.com/alexrivers',
          linkedinUrl: 'https://linkedin.com/in/alexrivers'
        }
      }
    }
  });

  const intern2 = await prisma.user.create({
    data: {
      email: 'intern2@company.com',
      passwordHash: hashedInternPassword,
      name: 'Sophia Chen',
      role: 'INTERN',
      status: 'ACTIVE',
      onlineStatus: 'AWAY',
      jobTitle: 'Backend Developer Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      profile: {
        create: {
          bio: 'Backend enthusiast focused on Node.js, Express, microservices, and database optimization.',
          phone: '+1 (555) 345-6789',
          department: 'Backend Core',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-12-01'),
          skills: 'Node.js, Express, PostgreSQL, Prisma, Redis, Docker',
          githubUrl: 'https://github.com/sophiachen',
          linkedinUrl: 'https://linkedin.com/in/sophiachen'
        }
      }
    }
  });

  const intern3 = await prisma.user.create({
    data: {
      email: 'intern3@company.com',
      passwordHash: hashedInternPassword,
      name: 'Marcus Vance',
      role: 'INTERN',
      status: 'ACTIVE',
      onlineStatus: 'OFFLINE',
      jobTitle: 'Fullstack Intern',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      profile: {
        create: {
          bio: 'Fullstack development intern passionate about REST APIs, real-time WebSockets, and UI/UX.',
          phone: '+1 (555) 456-7890',
          department: 'Fullstack Innovation',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-12-01'),
          skills: 'React, Node.js, Socket.IO, PostgreSQL, GraphQL',
          githubUrl: 'https://github.com/marcusvance',
          linkedinUrl: 'https://linkedin.com/in/marcusvance'
        }
      }
    }
  });

  console.log('Created users.');

  // 2. Create Teams
  const teamFrontend = await prisma.team.create({
    data: {
      name: 'Frontend Guild',
      description: 'Responsible for web client UI components, accessibility, and user interactions.',
      managerId: admin.id,
      members: {
        create: [
          { userId: intern1.id, role: 'LEAD' },
          { userId: intern3.id, role: 'MEMBER' }
        ]
      }
    }
  });

  const teamBackend = await prisma.team.create({
    data: {
      name: 'Backend Core',
      description: 'Handles server API endpoints, authentication, real-time websockets, and DB architecture.',
      managerId: admin.id,
      members: {
        create: [
          { userId: intern2.id, role: 'LEAD' },
          { userId: intern3.id, role: 'MEMBER' }
        ]
      }
    }
  });

  console.log('Created teams.');

  // 3. Create Projects
  const projectSaaS = await prisma.project.create({
    data: {
      name: 'SaaS Dashboard Redesign',
      description: 'Modernizing internal portal dashboard with Framer Motion, sleek cards, dark mode, and responsive views.',
      status: 'ACTIVE',
      startDate: new Date('2026-06-10'),
      dueDate: new Date('2026-10-31'),
      teamId: teamFrontend.id,
      managerId: admin.id,
      members: {
        create: [
          { userId: intern1.id },
          { userId: intern3.id }
        ]
      }
    }
  });

  const projectAPI = await prisma.project.create({
    data: {
      name: 'API Infrastructure & Socket.IO Migration',
      description: 'Building high-performance REST APIs, Prisma ORM queries, real-time messaging, and Gemini AI integration.',
      status: 'ACTIVE',
      startDate: new Date('2026-06-15'),
      dueDate: new Date('2026-11-15'),
      teamId: teamBackend.id,
      managerId: admin.id,
      members: {
        create: [
          { userId: intern2.id },
          { userId: intern3.id }
        ]
      }
    }
  });

  console.log('Created projects.');

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Build Dark Mode & Design System Components',
      description: 'Implement reusable buttons, card structures, badges, and smooth Framer Motion transitions in React.',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: new Date('2026-09-20'),
      projectId: projectSaaS.id,
      creatorId: admin.id,
      assignments: { create: { userId: intern1.id } }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement Socket.IO Real-time Chat Controller',
      description: 'Establish websocket connection handler, room joining, live typing events, and message storage.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date('2026-09-28'),
      projectId: projectAPI.id,
      creatorId: admin.id,
      assignments: { create: { userId: intern2.id } }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Integrate Gemini AI Contextual Assistant',
      description: 'Create API endpoints for General programming queries and permission-controlled Team data querying.',
      status: 'SUBMITTED',
      priority: 'HIGH',
      dueDate: new Date('2026-09-26'),
      projectId: projectAPI.id,
      creatorId: admin.id,
      assignments: { create: { userId: intern3.id } }
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Calendar & Event Reminder Views',
      description: 'Create month/week/day calendar grid with modal for scheduling meetings and event notifications.',
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      dueDate: new Date('2026-09-30'),
      projectId: projectSaaS.id,
      creatorId: admin.id,
      assignments: { create: { userId: intern1.id } }
    }
  });

  console.log('Created tasks.');

  // 5. Progress Updates
  await prisma.progressUpdate.create({
    data: {
      taskId: task1.id,
      userId: intern1.id,
      date: new Date('2026-09-19'),
      hoursWorked: 6.5,
      progressPct: 100,
      workCompleted: 'Finished building standard SaaS dashboard UI components with Framer Motion hover animations.',
      currentWork: 'Writing documentation and verifying responsive design on mobile views.',
      challenges: 'None encountered. CSS grid system aligned well.',
      nextPlan: 'Move to Calendar & Event views next.',
      reviewerId: admin.id,
      reviewNotes: 'Great work Alex! Design looks polished and transitions are very responsive.',
      isApproved: true
    }
  });

  await prisma.progressUpdate.create({
    data: {
      taskId: task3.id,
      userId: intern3.id,
      date: new Date('2026-09-22'),
      hoursWorked: 7.0,
      progressPct: 90,
      workCompleted: 'Developed Gemini API integration with dual modes (General AI & Team AI context filtering).',
      currentWork: 'Refining prompt construction to enforce authorization rules for intern vs admin role access.',
      challenges: 'Handling streaming response speed on slow connections.',
      nextPlan: 'Submit for final review after UI testing.',
      reviewerId: admin.id,
      reviewNotes: 'Under review by Sarah.',
      isApproved: false
    }
  });

  console.log('Created progress updates.');

  // 6. Events
  const event1 = await prisma.event.create({
    data: {
      title: 'Weekly Internship Standup & Demo',
      description: 'All interns present progress updates, review sprint tasks, and discuss upcoming roadmap.',
      startDate: new Date('2026-09-25T10:00:00Z'),
      endDate: new Date('2026-09-25T11:00:00Z'),
      location: 'Conference Room B / Virtual',
      meetingLink: 'https://meet.google.com/xyz-abc-demo',
      creatorId: admin.id,
      teamId: teamFrontend.id,
      projectId: projectSaaS.id,
      participants: {
        create: [
          { userId: admin.id },
          { userId: intern1.id },
          { userId: intern2.id },
          { userId: intern3.id }
        ]
      }
    }
  });

  console.log('Created events.');

  // 7. Attendance
  await prisma.attendance.createMany({
    data: [
      {
        userId: intern1.id,
        date: new Date('2026-09-22'),
        checkInTime: new Date('2026-09-22T09:00:00Z'),
        checkOutTime: new Date('2026-09-22T17:30:00Z'),
        totalHours: 8.5,
        status: 'PRESENT',
        notes: 'On-time check-in. High productivity.'
      },
      {
        userId: intern2.id,
        date: new Date('2026-09-22'),
        checkInTime: new Date('2026-09-22T09:15:00Z'),
        checkOutTime: new Date('2026-09-22T17:15:00Z'),
        totalHours: 8.0,
        status: 'PRESENT',
        notes: 'Worked on Socket controller.'
      },
      {
        userId: intern3.id,
        date: new Date('2026-09-22'),
        checkInTime: new Date('2026-09-22T09:30:00Z'),
        checkOutTime: new Date('2026-09-22T17:30:00Z'),
        totalHours: 8.0,
        status: 'PRESENT',
        notes: 'Worked on AI assistant.'
      }
    ]
  });

  console.log('Created attendance.');

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: intern1.id,
        title: 'Task Assigned',
        message: 'You have been assigned to "Calendar & Event Reminder Views".',
        type: 'TASK_ASSIGN',
        linkUrl: '/tasks'
      },
      {
        userId: intern2.id,
        title: 'Priority Task Update',
        message: 'Task "Implement Socket.IO Real-time Chat Controller" marked as URGENT.',
        type: 'TASK_ASSIGN',
        linkUrl: '/tasks'
      },
      {
        userId: admin.id,
        title: 'New Progress Submission',
        message: 'Marcus Vance submitted progress for "Integrate Gemini AI Contextual Assistant".',
        type: 'PROGRESS_SUBMIT',
        linkUrl: '/progress'
      }
    ]
  });

  console.log('Created notifications.');

  // 9. Conversations & Messages
  const directConv = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      participant1Id: admin.id,
      participant2Id: intern1.id,
      messages: {
        create: [
          {
            senderId: admin.id,
            content: 'Hi Alex! Outstanding work on the dark mode dashboard components.'
          },
          {
            senderId: intern1.id,
            content: 'Thank you Sarah! I am moving forward with the Calendar & Event module today.'
          }
        ]
      }
    }
  });

  const teamConv = await prisma.conversation.create({
    data: {
      type: 'TEAM',
      title: 'Frontend Guild General',
      teamId: teamFrontend.id,
      messages: {
        create: [
          {
            senderId: admin.id,
            content: 'Welcome team! Please make sure to submit daily progress updates by 6 PM.'
          },
          {
            senderId: intern1.id,
            content: 'Understood! I will upload design specs shortly.'
          }
        ]
      }
    }
  });

  console.log('Created conversations & messages.');
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
