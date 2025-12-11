import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  LogOut, 
  Menu, 
  GraduationCap,
  Bell,
  Search,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { label: 'Course Catalog', path: '/courses', icon: BookOpen, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { label: 'My Schedule', path: '/my-schedule', icon: Calendar, roles: [UserRole.STUDENT] },
    { label: 'Audit Logs', path: '/audit', icon: ShieldCheck, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <GraduationCap className="h-8 w-8 text-primary-600 mr-2" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">CampusHub</span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3">
            <div className="mb-6 px-3">
               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Module</p>
               <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium border border-blue-100">
                 Course Registration
               </div>
            </div>

            <nav className="space-y-1">
              {navItems.filter(item => item.roles.includes(user.role)).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center mb-4 px-2">
              <img 
                src={user.avatar || 'https://picsum.photos/200'} 
                alt="Profile" 
                className="h-10 w-10 rounded-full bg-gray-200 border border-gray-200"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 max-w-lg ml-4 lg:ml-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search courses, departments..."
              />
            </div>
          </div>

          <div className="ml-4 flex items-center">
            <button className="p-2 rounded-full text-gray-400 hover:text-primary-600 hover:bg-gray-100 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;