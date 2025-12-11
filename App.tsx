import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Events from './pages/Events';
import MySchedule from './pages/MySchedule';
import AuditLogs from './pages/AuditLogs';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { db } from './services/db';
import { User, UserRole } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const sessionUser = db.getSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const sessionUser = db.getSession();
    setUser(sessionUser);
  };

  const handleLogout = () => {
    db.clearSession();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<Layout user={user!} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Courses user={user!} />} />
            <Route path="/events" element={<Events user={user!} />} />
            
            {/* Student Only */}
            <Route element={<ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]} />}>
               <Route path="/my-schedule" element={<MySchedule user={user!} />} />
            </Route>

            {/* Admin Only */}
            <Route element={<ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]} />}>
               <Route path="/audit" element={<AuditLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;