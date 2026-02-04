import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, PlusCircle, ArrowUpRight, ArrowRight, UserCheck, Activity, Trash2, UserPlus, Filter, Download, Edit3, Zap, Send, MapPin, Link2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { toast } from 'react-toastify';
import api from '../services/api';

const FacultyDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [newCourse, setNewCourse] = useState({ course_code: '', course_name: '', department: '', credits: 3, semester: 1, room_number: '', syllabus_link: '' });
    const [editingCourse, setEditingCourse] = useState(null);
    const [enrollData, setEnrollData] = useState({ roll_number: '', course_id: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/dashboard/faculty');
            setData(response.data);
            if (response.data.faculty_info?.department) {
                setNewCourse(prev => ({ ...prev, department: response.data.faculty_info.department }));
            }
        } catch (error) {
            console.error("Error fetching faculty data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/faculty/courses', newCourse);
            toast.success("Course created successfully!");
            setIsCreateModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to create course");
        }
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/faculty/courses/enroll', enrollData);
            toast.success("Student enrolled successfully!");
            setIsEnrollModalOpen(false);
            setEnrollData({ roll_number: '', course_id: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Enrollment failed");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure? This will delete all course data.")) return;
        try {
            await api.delete(`/api/faculty/courses/${id}`);
            toast.success("Course deleted");
            fetchData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/faculty/courses/${editingCourse.course_id}`, editingCourse);
            toast.success("Course updated!");
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleQuickMark = async (courseId) => {
        if (!window.confirm("This will mark ALL enrolled students as PRESENT for today. Proceed?")) return;
        try {
            await api.post(`/api/faculty/courses/${courseId}/quick-mark`);
            toast.success("Awaiting sync... Bulk attendance marked!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Bulk action failed");
        }
    };

    const handleSendReminder = async (courseId) => {
        setIsSendingReminder(true);
        try {
            await api.post('/api/notifications/send', {
                course_id: courseId,
                title: "Attendance Reminder",
                message: "Please ensure your attendance is marked for today's session."
            });
            toast.success("Broadcast sent to all students!");
        } catch (error) {
            toast.error("Failed to send broadcast");
        } finally {
            setIsSendingReminder(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Establishing secure connection...</p>
            </div>
        );
    }

    const courses = data?.courses || [];
    const stats = data?.stats || { total_students: 0, avg_attendance: 0, total_courses: 0 };

    const chartData = courses.map(c => ({
        name: c.course_code,
        attendance: c.avg_attendance,
        students: c.student_count
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Faculty Portal</h1>
                    <p className="page-subtitle">
                        Academic Command Center for {data?.faculty_info?.department || 'Department'}
                    </p>
                </div>
                <Link to="/mark-attendance" className="btn-primary" style={{ gap: '8px', padding: '12px 24px', borderRadius: '12px' }}>
                    <PlusCircle size={18} />
                    Begin Session
                </Link>
            </div>

            {/* Top Row: Big Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
                    <p className="stat-label">Total Managed Students</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <p className="stat-value">{stats.total_students}</p>
                        <span className="badge-info">Active</span>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <p className="stat-label">Course Average Attendance</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <p className="stat-value" style={{ color: '#059669' }}>{stats.avg_attendance}%</p>
                        <span className="pill-badge pill-badge-success">On Track</span>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <p className="stat-label">Active Courses</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <p className="stat-value" style={{ color: '#d97706' }}>{stats.total_courses}</p>
                        <span className="badge-warning">Semester 1</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Analytics & Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="card-title">Daily Attendance Volume</h2>
                            <p style={{ fontSize: '11px', color: '#64748b' }}>Activity trend over last 7 days</p>
                        </div>
                        <div className="badge-info">Live Sync</div>
                    </div>
                    <div style={{ height: '300px', marginTop: '24px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.daily_activity || []}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
                                <Area type="monotone" dataKey="absent" stroke="#f43f5e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Quick Actions</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '20px' }}>
                        <button onClick={() => setIsCreateModalOpen(true)} className="dropdown-item" style={{ backgroundColor: '#f8fafc', padding: '16px' }}>
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}><PlusCircle size={20} /></div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '13px' }}>Create Course</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Add new academic subject</p>
                            </div>
                        </button>
                        <button onClick={() => { setIsEnrollModalOpen(true); }} className="dropdown-item" style={{ backgroundColor: '#f8fafc', padding: '16px' }}>
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><UserPlus size={20} /></div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '13px' }}>Enroll Student</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Link student by Roll Number</p>
                            </div>
                        </button>
                        <button
                            disabled={isSendingReminder || courses.length === 0}
                            onClick={() => handleSendReminder(courses[0]?.course_id)}
                            className="dropdown-item"
                            style={{ backgroundColor: '#f8fafc', padding: '16px', opacity: (isSendingReminder || courses.length === 0) ? 0.6 : 1 }}
                        >
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}><Send size={20} /></div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '13px' }}>{isSendingReminder ? 'Broadcasting...' : 'Blast Reminder'}</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Notify all students in primary course</p>
                            </div>
                        </button>
                        <Link to="/reports" className="dropdown-item" style={{ backgroundColor: '#f8fafc', padding: '16px' }}>
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}><Activity size={20} /></div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '13px' }}>View Reports</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Generate participation data</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Courses Management Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title">Course Management Center</h2>
                    <span className="badge-info">{courses.length} Active Courses</span>
                </div>
                <div className="table-container" style={{ border: 'none', boxShadow: 'none', marginTop: '12px' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Students</th>
                                <th>Performance</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px', color: '#475569' }}>
                                                {course.course_code.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '14px' }}>{course.course_name}</p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>{course.course_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{course.student_count}</p>
                                        <p style={{ fontSize: '11px', color: '#64748b' }}>Enrolled</p>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="progress-bar" style={{ width: '80px' }}>
                                                <div className="progress-bar-fill" style={{ width: `${course.avg_attendance}%`, backgroundColor: course.avg_attendance < 75 ? '#f43f5e' : '#10b981' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700' }}>{course.avg_attendance}%</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                title="Quick Mark All Present"
                                                onClick={() => handleQuickMark(course.course_id)}
                                                className="btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#059669' }}
                                            >
                                                <Zap size={14} />
                                            </button>
                                            <button
                                                title="Edit Course Metadata"
                                                onClick={() => { setEditingCourse(data.courses.find(c => c.course_id === course.course_id)); setIsEditModalOpen(true); }}
                                                className="btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <Link to={`/mark-attendance?course=${course.course_id}`} className="btn-primary" style={{ padding: '6px 10px', fontSize: '11px' }}>Verify</Link>
                                            <button onClick={() => handleDeleteCourse(course.course_id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#f43f5e' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
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
                                        <input type="number" required value={newCourse.semester} onChange={e => setNewCourse({ ...newCourse, semester: e.target.value })} className="input-field" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>CREDITS</label>
                                        <input type="number" required value={newCourse.credits} onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })} className="input-field" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}><MapPin size={12} /> ROOM NUMBER</label>
                                        <input value={newCourse.room_number} onChange={e => setNewCourse({ ...newCourse, room_number: e.target.value })} className="input-field" placeholder="e.g. 402-B" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}><Link2 size={12} /> SYLLABUS URL</label>
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

                {isEnrollModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '400px' }}>
                            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Enroll Student</h2>
                            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>SELECT COURSE</label>
                                    <select required value={enrollData.course_id} onChange={e => setEnrollData({ ...enrollData, course_id: e.target.value })} className="input-field">
                                        <option value="">Choose a course...</option>
                                        {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>STUDENT ROLL NUMBER</label>
                                    <input required value={enrollData.roll_number} onChange={e => setEnrollData({ ...enrollData, roll_number: e.target.value })} className="input-field" placeholder="e.g. STU12345" />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Enroll Student</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

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
            </AnimatePresence>
        </motion.div>
    );
};

export default FacultyDashboard;
