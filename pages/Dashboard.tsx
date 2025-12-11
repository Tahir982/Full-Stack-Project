import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BookOpen, Users, GraduationCap, Clock } from 'lucide-react';
import { db } from '../services/db';
import { UserRole } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const courses = db.getCourses();
  const session = db.getSession();
  const enrollments = db.getEnrollments();
  
  // Compute Stats
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  const totalCapacity = courses.reduce((acc, curr) => acc + curr.capacity, 0);
  
  // Specific stats for student
  const studentStats = session?.role === UserRole.STUDENT 
    ? db.getStudentEnrollments(session.id) 
    : [];
  const myCredits = studentStats.reduce((acc, curr) => acc + curr.credits, 0);

  // Chart Data: Enrollments per Course
  const enrollmentData = courses.map(c => ({
    name: c.code,
    enrolled: c.enrolledCount,
    remaining: c.capacity - c.enrolledCount
  })).slice(0, 5); // Top 5

  // Chart Data: Courses by Department
  const deptData = Object.entries(courses.reduce((acc: any, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm p-6 flex items-center">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 mr-4`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {session?.role === UserRole.STUDENT ? `Welcome back, ${session.name}!` : 'Academic Overview'}
        </h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {session?.role === UserRole.STUDENT ? (
            <>
              <StatCard title="My Courses" value={studentStats.length} icon={BookOpen} color="bg-blue-500" />
              <StatCard title="Total Credits" value={myCredits} icon={GraduationCap} color="bg-green-500" />
              <StatCard title="Available Courses" value={totalCourses} icon={Users} color="bg-yellow-500" />
            </>
        ) : (
            <>
              <StatCard title="Total Courses" value={totalCourses} icon={BookOpen} color="bg-blue-500" />
              <StatCard title="Total Enrollments" value={totalEnrollments} icon={Users} color="bg-green-500" />
              <StatCard title="Avg Class Size" value={Math.round(totalEnrollments / (totalCourses || 1))} icon={Users} color="bg-purple-500" />
            </>
        )}
        <StatCard title="Capacity Usage" value={`${Math.round((totalEnrollments/totalCapacity)*100)}%`} icon={Clock} color="bg-indigo-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Courses by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {deptData.map((entry, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Enrollment Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="enrolled" fill="#3b82f6" name="Enrolled" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;