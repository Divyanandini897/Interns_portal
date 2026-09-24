import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/layout/Layout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Dashboards
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { InternDashboard } from './pages/intern/InternDashboard';

// Core Pages
import { InternsManagement } from './pages/admin/InternsManagement';
import { TeamsManagement } from './pages/teams/TeamsManagement';
import { ProjectsManagement } from './pages/projects/ProjectsManagement';
import { TasksManagement } from './pages/tasks/TasksManagement';
import { ProgressTracking } from './pages/progress/ProgressTracking';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ChatPage } from './pages/chat/ChatPage';
import { AiAssistantPage } from './pages/ai/AiAssistantPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MyWork } from './pages/intern/MyWork';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('ADMIN' | 'INTERN')[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Loading InternPulse Workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/intern/dashboard'} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/intern/dashboard'} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes with Sidebar Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RootRedirect />} />
              <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="intern/dashboard" element={<ProtectedRoute allowedRoles={['INTERN']}><InternDashboard /></ProtectedRoute>} />
              <Route path="interns" element={<ProtectedRoute allowedRoles={['ADMIN']}><InternsManagement /></ProtectedRoute>} />
              <Route path="teams" element={<TeamsManagement />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="tasks" element={<TasksManagement />} />
              <Route path="progress" element={<ProgressTracking />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="ai" element={<AiAssistantPage />} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />
              <Route path="my-work" element={<ProtectedRoute allowedRoles={['INTERN']}><MyWork /></ProtectedRoute>} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;
