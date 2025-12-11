import { User, Course, Enrollment, UserRole, Event, AuditLog } from '../types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@campus.edu', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/1/200/200' },
  { id: '2', name: 'Dr. Tayyab', email: 'teacher@campus.edu', role: UserRole.TEACHER, avatar: 'https://picsum.photos/id/2/200/200' },
  { id: '3', name: 'Awais Student', email: 'student@campus.edu', role: UserRole.STUDENT, avatar: 'https://picsum.photos/id/3/200/200' },
];

const INITIAL_COURSES: Course[] = [
  {
    id: '101',
    code: 'CS-101',
    title: 'Introduction to Programming',
    description: 'Fundamental concepts of programming using Python. Topics include variables, loops, and functions.',
    credits: 3,
    department: 'Computer Science',
    instructor: 'Dr. Ali',
    schedule: 'Mon/Wed 09:00 AM',
    capacity: 60,
    enrolledCount: 45,
    isActive: true
  },
  {
    id: '102',
    code: 'MATH-201',
    title: 'Linear Algebra',
    description: 'Vector spaces, linear transformations, matrices, systems of linear equations, determinants, and eigenvectors.',
    credits: 4,
    department: 'Mathematics',
    instructor: 'Prof. Sarah ',
    schedule: 'Tue/Thu 11:00 AM',
    capacity: 40,
    enrolledCount: 38,
    isActive: true
  },
  {
    id: '103',
    code: 'ENG-105',
    title: 'Technical Writing',
    description: 'Development of technical writing skills for engineering and science professionals.',
    credits: 2,
    department: 'Humanities',
    instructor: 'Dr. Emily White',
    schedule: 'Fri 10:00 AM',
    capacity: 30,
    enrolledCount: 12,
    isActive: true
  }
];

const INITIAL_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Tech Symposium 2024',
    description: 'A gathering of minds to discuss the future of technology and AI on campus.',
    category: 'Academic',
    date: '2024-04-15',
    location: 'Main Auditorium',
    capacity: 200,
    registeredCount: 45,
    status: 'Upcoming',
    createdBy: '1',
    organizer: 'Admin User',
    imageUrl: 'https://picsum.photos/seed/tech/800/400'
  }
];

const STORAGE_KEYS = {
  USERS: 'campushub_users',
  COURSES: 'campushub_courses',
  ENROLLMENTS: 'campushub_enrollments',
  EVENTS: 'campushub_events',
  SESSION: 'campushub_session',
  AUDIT: 'campushub_audit',
};

// Helper for hashing (simulation)
const simpleHash = (str: string) => str.split('').reverse().join('') + 'SALT';

export const db = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([]));
    }
  },

  // Audit Logs
  logAction: (userId: string, action: string, details: string) => {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]');
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    
    const newLog: AuditLog = {
      id: Date.now().toString(),
      userId,
      userName: user ? user.name : 'Unknown',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1' // Simulated IP
    };
    
    logs.unshift(newLog); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
  },

  getAuditLogs: (): AuditLog[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]'),

  // User Methods
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  
  registerUser: (name: string, email: string, password: string, role: UserRole): { success: boolean, message?: string } => {
    const users = db.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // In simulation we don't store the password in the user object because we aren't implementing a real auth backend here
    // But we simulate the log
    db.logAction(newUser.id, 'REGISTER', `New user registered: ${email} as ${role}`);
    
    return { success: true };
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.find((u: User) => u.email === email);
  },

  // Course Methods
  getCourses: (includeArchived = false): Course[] => {
    const courses: Course[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
    return includeArchived ? courses : courses.filter(c => c.isActive !== false);
  },
  
  saveCourses: (courses: Course[], userId: string, action: string) => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    db.logAction(userId, action, 'Modified course list');
  },

  softDeleteCourse: (courseId: string, userId: string) => {
    const courses = db.getCourses(true);
    const updated = courses.map(c => c.id === courseId ? { ...c, isActive: false } : c);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
    db.logAction(userId, 'DELETE_COURSE', `Soft deleted course ID ${courseId}`);
  },

  // Enrollment Methods
  getEnrollments: (): Enrollment[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || '[]'),

  enrollStudent: (courseId: string, studentId: string): { success: boolean; message: string } => {
    const courses = db.getCourses(true); // check archived too just in case
    const enrollments = db.getEnrollments();
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return { success: false, message: 'Course not found' };
    
    const course = courses[courseIndex];

    if (!course.isActive) return { success: false, message: 'Course is no longer active' };

    // Check capacity
    if (course.enrolledCount >= course.capacity) {
      db.logAction(studentId, 'ENROLL_FAILED', `Course ${course.code} is full`);
      return { success: false, message: 'Course is full' };
    }

    // Check if already enrolled
    const existing = enrollments.find(e => e.courseId === courseId && e.studentId === studentId);
    if (existing) {
      return { success: false, message: 'Already enrolled in this course' };
    }

    // Enroll
    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      courseId,
      studentId,
      enrolledAt: new Date().toISOString()
    };

    enrollments.push(newEnrollment);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // Update course count
    courses[courseIndex].enrolledCount += 1;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    
    db.logAction(studentId, 'ENROLL', `Enrolled in ${course.code}`);

    return { success: true, message: 'Successfully enrolled' };
  },

  dropCourse: (courseId: string, studentId: string) => {
    let enrollments = db.getEnrollments();
    enrollments = enrollments.filter(e => !(e.courseId === courseId && e.studentId === studentId));
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // Update course count
    const courses = db.getCourses(true);
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      courses[courseIndex].enrolledCount = Math.max(0, courses[courseIndex].enrolledCount - 1);
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }
    
    db.logAction(studentId, 'DROP_COURSE', `Dropped course ID ${courseId}`);
  },

  getStudentEnrollments: (studentId: string): Course[] => {
    const enrollments = db.getEnrollments();
    const courses = db.getCourses(true);
    
    const studentEnrollmentIds = enrollments
      .filter(e => e.studentId === studentId)
      .map(e => e.courseId);
      
    return courses.filter(c => studentEnrollmentIds.includes(c.id));
  },

  // Event Methods (Preserved for completeness)
  getEvents: (): Event[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]'),
  saveEvents: (events: Event[]) => localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)),

  // Session Methods
  getSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  setSession: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    db.logAction(user.id, 'LOGIN', 'User logged in');
  },
  
  clearSession: () => {
    const session = db.getSession();
    if (session) db.logAction(session.id, 'LOGOUT', 'User logged out');
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};

// Initialize on load
db.init();