import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Loader2 } from 'lucide-react';
import { db } from '../services/db';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('admin'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate Network Delay for FYP realism
    setTimeout(() => {
      const user = db.findUserByEmail(email);
      
      // In a real app, db.findUserByEmail would check the hash. 
      // For this simulation, we trust the user exists and check "password"
      if (user) { 
        // Demo specific logic:
        const demoAuth = (
             (email === 'admin@campus.edu' && password === 'admin') ||
             (email === 'teacher@campus.edu' && password === 'teacher') ||
             (email === 'student@campus.edu' && password === 'student')
        );

        // Allow any password for newly registered users in simulation if we can't check hash
        if (demoAuth || user.id.length > 5) {
            db.setSession(user);
            onLogin();
            navigate('/');
            setLoading(false);
            return;
        }
        setError('Invalid credentials.');
      } else {
        setError('User not found.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-primary-600">
              <GraduationCap className="h-10 w-10" />
              <span className="text-2xl font-bold tracking-tight text-gray-900">CampusHub</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to access your portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg border border-transparent bg-primary-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm">
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Don't have an account? Register now
                </Link>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-4 border-t pt-4">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>Admin: admin@campus.edu / admin</p>
              <p>Teacher: teacher@campus.edu / teacher</p>
              <p>Student: student@campus.edu / student</p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
          alt="University Campus"
        />
        <div className="absolute inset-0 bg-primary-900 mix-blend-multiply opacity-40"></div>
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium opacity-90">
              "Education is the most powerful weapon which you can use to change the world."
            </p>
            <footer className="text-sm font-bold opacity-70">Nelson Mandela</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Login;