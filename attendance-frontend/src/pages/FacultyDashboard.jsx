import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { BookOpen, Users, CheckCircle, PlusCircle, ArrowUpRight, ArrowRight, UserCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const FacultyDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getFacultyData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching faculty data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Establishing secure connection...</p>
            </div>
        );
    }

    const courses = data?.courses || [];
    const totalStudents = courses.reduce((acc, c) => acc + (c.student_count || 0), 0);

    const statCards = [
        { label: 'Active Roster', value: courses.length, sub: 'Assigned Courses', icon: BookOpen, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'Total Enrollment', value: totalStudents, sub: 'Unique Students', icon: Users, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Session Velocity', value: 'High', sub: 'Weekly Activity', icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
    ];

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

            {/* Stats Roster */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="stat-card" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    backgroundColor: stat.bg, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon size={22} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Live Status</span>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <p className="stat-value" style={{ fontSize: '24px' }}>{stat.value}</p>
                                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{stat.sub}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Courses Management */}
                <div className="table-container">
                    <div style={{ padding: '24px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Assigned Courses</h2>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Manage attendance for your current academic load.</p>
                        </div>
                        <span className="badge-info">{courses.length} Active Courses</span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="empty-state" style={{ padding: '64px' }}>
                            <div className="empty-state-icon"><BookOpen size={32} /></div>
                            <p style={{ fontWeight: '600', color: '#0f172a' }}>No courses assigned yet</p>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Synchronize with the Registrar to view your courses.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Course Identity</th>
                                    <th>Participation</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div className="avatar" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px' }}>
                                                    {course.course_code.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '14.5px' }}>{course.course_name}</p>
                                                    <p style={{ fontSize: '12px', color: '#64748b' }}>{course.course_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ flex: 1, minWidth: '100px' }}>
                                                    <div className="progress-bar" style={{ height: '6px' }}>
                                                        <div className="progress-bar-fill" style={{ width: '85%', backgroundColor: '#10b981' }} />
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>{course.student_count} Students</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link
                                                to={`/mark-attendance?course=${course.course_id}`}
                                                className="btn-secondary"
                                                style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', gap: '4px' }}
                                            >
                                                View Roster <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Sidebar Tasks / Notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', border: 'none' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Course Analytics</h3>
                        <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.5' }}>Generate detailed attendance trends and participation reports for your courses.</p>
                        <button style={{
                            width: '100%', padding: '10px', borderRadius: '8px',
                            backgroundColor: 'white', color: '#4f46e5', fontWeight: '700',
                            border: 'none', cursor: 'pointer', fontSize: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            View Analytics <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="card">
                        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 className="card-title" style={{ fontSize: '14px' }}>Recent Submissions</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[1, 2].map((i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                                        <UserCheck size={16} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>CS101 Session marked</p>
                                        <p style={{ fontSize: '11px', color: '#94a3b8' }}>Today, 10:24 AM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FacultyDashboard;
