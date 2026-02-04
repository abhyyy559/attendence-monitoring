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
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [enrollData, setEnrollData] = useState({ roll_number: '', course_id: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/dashboard/faculty');
            setData(response.data);
        } catch (error) {
            console.error("Error fetching faculty data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


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
                        <Link to="/faculty/courses" className="dropdown-item" style={{ backgroundColor: '#f8fafc', padding: '16px', textDecoration: 'none' }}>
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}><PlusCircle size={20} /></div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ fontWeight: '700', fontSize: '13px' }}>Manage Courses</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>View and create courses</p>
                            </div>
                        </Link>
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

            {/* Quick Course Overview Link */}
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <BookOpen size={48} style={{ color: '#4f46e5', margin: '0 auto 16px', opacity: 0.7 }} />
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    Manage Your Courses
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                    View, create, and manage all your course offerings
                </p>
                <Link to="/faculty/courses" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} />
                    Go to My Courses
                </Link>
            </div>

            {/* Modals */}
            <AnimatePresence>
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

            </AnimatePresence>
        </motion.div>
    );
};

export default FacultyDashboard;
