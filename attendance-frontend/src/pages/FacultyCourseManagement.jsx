import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlusCircle, Edit3, Trash2, Users, Eye, Search, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../services/api';

const FacultyCourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [activeCourseForEnroll, setActiveCourseForEnroll] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [newCourse, setNewCourse] = useState({ 
        course_code: '', 
        course_name: '', 
        department: '', 
        credits: 3, 
        semester: 1, 
        room_number: '', 
        syllabus_link: '' 
    });
    const [editingCourse, setEditingCourse] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/faculty/courses');
            setCourses(response.data || []);
        } catch (error) {
            console.error("Error fetching courses", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
        // Get department from dashboard to pre-fill
        api.get('/api/dashboard/faculty')
            .then(response => {
                if (response.data.faculty_info?.department) {
                    setNewCourse(prev => ({ ...prev, department: response.data.faculty_info.department }));
                }
            })
            .catch(() => {});
    }, []);

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await api.get('/api/students');
            setStudents(res.data || []);
        } catch (e) {
            console.error("Failed to load students", e);
            toast.error("Failed to load students list");
        } finally {
            setStudentsLoading(false);
        }
    };

    const openEnrollModal = async (course) => {
        setActiveCourseForEnroll(course);
        setEnrollModalOpen(true);
        setSelectedStudentId('');
        setStudentSearch('');
        if (students.length === 0) {
            await fetchStudents();
        }
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        if (!activeCourseForEnroll?.course_id) return;
        if (!selectedStudentId) {
            toast.warn("Please select a student");
            return;
        }
        try {
            await api.post(`/api/faculty/courses/${activeCourseForEnroll.course_id}/enroll`, {
                student_id: selectedStudentId
            });
            toast.success("Student Enrolled!");
            setEnrollModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Enrollment failed");
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/faculty/courses', newCourse);
            toast.success("Course created successfully!");
            setIsCreateModalOpen(false);
            setNewCourse({ course_code: '', course_name: '', department: newCourse.department, credits: 3, semester: 1, room_number: '', syllabus_link: '' });
            // CRITICAL: Refresh the list immediately
            await fetchCourses();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to create course");
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/faculty/courses/${editingCourse.course_id}`, editingCourse);
            toast.success("Course updated!");
            setIsEditModalOpen(false);
            await fetchCourses();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure? This will delete all course data.")) return;
        try {
            await api.delete(`/api/faculty/courses/${id}`);
            toast.success("Course deleted");
            await fetchCourses();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const filteredCourses = courses.filter(c =>
        c.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.roll_number?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Loading courses...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Manage Courses</h1>
                    <p className="page-subtitle">Create, edit, and manage your course offerings</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="btn-primary" 
                    style={{ gap: '8px', padding: '12px 24px', borderRadius: '12px' }}
                >
                    <PlusCircle size={18} />
                    Create New Course
                </button>
            </div>

            {/* Search Bar */}
            <div className="card" style={{ padding: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search courses by name, code, or department..."
                        className="input-field"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                    />
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
                <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <BookOpen size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
                    <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '18px', marginBottom: '8px' }}>
                        {searchQuery ? 'No courses match your search' : 'No courses yet'}
                    </p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                        {searchQuery ? 'Try adjusting your search terms.' : 'Create your first course to get started.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredCourses.map((course) => (
                        <motion.div
                            key={course.course_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card"
                            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '48px', 
                                            height: '48px', 
                                            borderRadius: '12px', 
                                            backgroundColor: '#eef2ff', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontWeight: '800',
                                            fontSize: '14px',
                                            color: '#4f46e5'
                                        }}>
                                            {course.course_code?.substring(0, 2) || 'CS'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                                                {course.course_name}
                                            </p>
                                            <p style={{ fontSize: '12px', color: '#64748b' }}>{course.course_code}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                        <span className="badge-info" style={{ fontSize: '11px' }}>{course.department}</span>
                                        <span className="badge-warning" style={{ fontSize: '11px' }}>Sem {course.semester}</span>
                                        <span className="badge-info" style={{ fontSize: '11px' }}>{course.credits} Credits</span>
                                    </div>
                                    {course.room_number && (
                                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                            📍 Room: {course.room_number}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <Link 
                                    to={`/mark-attendance?course=${course.course_id}`} 
                                    className="btn-primary" 
                                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', textAlign: 'center' }}
                                >
                                    <Eye size={14} style={{ marginRight: '4px' }} />
                                    View Students
                                </Link>
                                <button
                                    onClick={() => openEnrollModal(course)}
                                    className="btn-secondary"
                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                    title="Manage / Enroll Students"
                                >
                                    <UserPlus size={14} />
                                </button>
                                <button
                                    onClick={() => { setEditingCourse(course); setIsEditModalOpen(true); }}
                                    className="btn-secondary"
                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.course_id)}
                                    className="btn-secondary"
                                    style={{ padding: '8px 12px', fontSize: '12px', color: '#f43f5e' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '480px' }}>
                            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Create New Course</h2>
                            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>COURSE CODE</label>
                                    <input required value={newCourse.course_code} onChange={e => setNewCourse({ ...newCourse, course_code: e.target.value })} className="input-field" placeholder="e.g. CS-101" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>COURSE NAME</label>
                                    <input required value={newCourse.course_name} onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })} className="input-field" placeholder="e.g. Data Structures" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>SEMESTER</label>
                                        <input type="number" required value={newCourse.semester} onChange={e => setNewCourse({ ...newCourse, semester: parseInt(e.target.value) })} className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>CREDITS</label>
                                        <input type="number" required value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })} className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>DEPARTMENT</label>
                                    <input required value={newCourse.department} onChange={e => setNewCourse({ ...newCourse, department: e.target.value })} className="input-field" placeholder="e.g. Computer Science" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>ROOM NUMBER</label>
                                        <input value={newCourse.room_number} onChange={e => setNewCourse({ ...newCourse, room_number: e.target.value })} className="input-field" placeholder="e.g. 402-B" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>SYLLABUS URL</label>
                                        <input value={newCourse.syllabus_link} onChange={e => setNewCourse({ ...newCourse, syllabus_link: e.target.value })} className="input-field" placeholder="https://..." />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Course</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Course Modal */}
                {isEditModalOpen && editingCourse && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '480px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 className="card-title" style={{ fontSize: '20px' }}>Modify Course</h2>
                                <span className="badge-info">{editingCourse.course_code}</span>
                            </div>
                            <form onSubmit={handleEditCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>COURSE NAME</label>
                                    <input required value={editingCourse.course_name} onChange={e => setEditingCourse({ ...editingCourse, course_name: e.target.value })} className="input-field" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>ROOM</label>
                                        <input value={editingCourse.room_number || ''} onChange={e => setEditingCourse({ ...editingCourse, room_number: e.target.value })} className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>SYLLABUS URL</label>
                                        <input value={editingCourse.syllabus_link || ''} onChange={e => setEditingCourse({ ...editingCourse, syllabus_link: e.target.value })} className="input-field" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Discard</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Apply Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Enroll Students Modal */}
                {enrollModalOpen && activeCourseForEnroll && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '520px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 className="card-title" style={{ fontSize: '18px' }}>Enroll Students</h2>
                                <span className="badge-info">{activeCourseForEnroll.course_code}</span>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>
                                    Select a student to enroll into <b>{activeCourseForEnroll.course_name}</b>.
                                </p>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search student by name, roll number, or email..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    style={{ paddingLeft: '42px' }}
                                />
                            </div>

                            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>SELECT STUDENT</label>
                                    <select
                                        className="input-field"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        disabled={studentsLoading}
                                        required
                                    >
                                        <option value="">{studentsLoading ? 'Loading students...' : 'Choose a student...'}</option>
                                        {filteredStudents.map(s => (
                                            <option key={s.student_id} value={s.student_id}>
                                                {s.full_name} ({s.roll_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button type="button" onClick={() => setEnrollModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Close</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add to Course</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FacultyCourseManagement;
