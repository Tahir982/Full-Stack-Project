import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  Filter,
  X,
  Loader2,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  Archive
} from 'lucide-react';
import { db } from '../services/db';
import { Course, UserRole, User } from '../types';
import { generateCourseDescription } from '../services/geminiService';

interface CoursesProps {
  user: User;
}

const Courses: React.FC<CoursesProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Form State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    title: '',
    department: 'Computer Science',
    credits: 3,
    instructor: '',
    schedule: '',
    capacity: 40,
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    // Admin sees all (including soft-deleted), others see only active
    // For FYP simulation, db.getCourses(true) retrieves all.
    // Real backend handles this via query params.
    const allCourses = db.getCourses(user.role === UserRole.ADMIN);
    setCourses(allCourses);
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async () => {
    if (!formData.title || !formData.department) return;
    setIsGenerating(true);
    const desc = await generateCourseDescription(formData.title!, formData.department!);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allCourses = db.getCourses(true);
    
    if (editingCourse) {
      // Update
      const updated = allCourses.map(c => 
        c.id === editingCourse.id ? { ...c, ...formData } as Course : c
      );
      db.saveCourses(updated, user.id, 'UPDATE_COURSE');
      showNotification('Course updated successfully', 'success');
    } else {
      // Create
      const newCourse: Course = {
        ...formData as Course,
        id: Date.now().toString(),
        enrolledCount: 0,
        isActive: true
      };
      db.saveCourses([...allCourses, newCourse], user.id, 'CREATE_COURSE');
      showNotification('Course created successfully', 'success');
    }
    
    closeModal();
    loadCourses();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course? This will archive it (Soft Delete).')) {
      db.softDeleteCourse(id, user.id);
      loadCourses();
      showNotification('Course archived (Soft Deleted)', 'success');
    }
  };

  const handleEnroll = (courseId: string) => {
    const result = db.enrollStudent(courseId, user.id);
    if (result.success) {
      showNotification(result.message, 'success');
      loadCourses();
    } else {
      showNotification(result.message, 'error');
    }
  };

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        code: '',
        title: '',
        department: 'Computer Science',
        credits: 3,
        instructor: user.role === UserRole.TEACHER ? user.name : '',
        schedule: '',
        capacity: 40,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const canManage = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;
  const studentEnrollments = user.role === UserRole.STUDENT ? db.getStudentEnrollments(user.id).map(c => c.id) : [];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || course.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-8 z-50 px-4 py-2 rounded shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
           <p className="text-gray-500">Browse and manage available courses for the semester</p>
        </div>
        {canManage && (
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or code (e.g. CS-101)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Humanities">Humanities</option>
            <option value="Engineering">Engineering</option>
          </select>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code & Title</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredCourses.map((course) => {
                 const isEnrolled = studentEnrollments.includes(course.id);
                 const isFull = course.enrolledCount >= course.capacity;

                 return (
                   <tr key={course.id} className={`hover:bg-gray-50 transition-colors ${!course.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                     <td className="px-6 py-4">
                       <div className="flex items-center">
                         <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg font-bold text-xs ${!course.isActive ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                           {course.code.split('-')[0]}
                         </div>
                         <div className="ml-4">
                           <div className="text-sm font-medium text-gray-900">
                             {course.title} { !course.isActive && <span className="text-xs text-red-500 ml-2">(Archived)</span>}
                           </div>
                           <div className="text-sm text-gray-500">{course.code} • {course.instructor}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400"/> {course.schedule}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                         {course.credits} Credits
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                         <span className="text-sm text-gray-900">{course.enrolledCount} / {course.capacity}</span>
                         <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                           <div 
                              className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${(course.enrolledCount / course.capacity) * 100}%` }}
                           />
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {canManage ? (
                         <div className="flex justify-end gap-2">
                           <button onClick={() => openModal(course)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-5 w-5"/></button>
                           {user.role === UserRole.ADMIN && course.isActive && (
                              <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900"><Archive className="h-5 w-5"/></button>
                           )}
                         </div>
                       ) : (
                         course.isActive && (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={isEnrolled || isFull}
                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border
                              ${isEnrolled 
                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-default'
                                : isFull 
                                    ? 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed'
                                    : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
                              }`}
                          >
                            {isEnrolled ? 'Enrolled' : isFull ? 'Full' : 'Enroll'}
                          </button>
                         )
                       )}
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500"><X className="h-6 w-6" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Code</label>
                      <input name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. CS-101" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credits</label>
                      <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                         <option value="Computer Science">Computer Science</option>
                         <option value="Mathematics">Mathematics</option>
                         <option value="Humanities">Humanities</option>
                         <option value="Engineering">Engineering</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Instructor</label>
                       <input name="instructor" value={formData.instructor} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-gray-700">Syllabus Description</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !formData.title}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1" />}
                        Generate with AI
                      </button>
                    </div>
                    <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Schedule</label>
                      <input name="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="Mon/Wed 10:00 AM" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button type="button" onClick={closeModal} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">Cancel</button>
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm">{editingCourse ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;