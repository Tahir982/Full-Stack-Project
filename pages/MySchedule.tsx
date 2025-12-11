import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Course, User } from '../types';
import { Clock, BookOpen, Trash2 } from 'lucide-react';

interface MyScheduleProps {
  user: User;
}

const MySchedule: React.FC<MyScheduleProps> = ({ user }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = () => {
    setEnrolledCourses(db.getStudentEnrollments(user.id));
  };

  const handleDrop = (courseId: string) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      db.dropCourse(courseId, user.id);
      loadMyCourses();
    }
  };

  const totalCredits = enrolledCourses.reduce((acc, curr) => acc + curr.credits, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium">
          Total Credits: {totalCredits}
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses enrolled</h3>
          <p className="text-gray-500 mt-1">Visit the Course Catalog to register for classes.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {enrolledCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.code}
                  </span>
                  <span className="text-sm text-gray-500">{course.credits} Credits</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
                
                <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-primary-600" />
                  {course.schedule}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleDrop(course.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Drop Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySchedule;