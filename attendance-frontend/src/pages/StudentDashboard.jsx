import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { BookOpen, TrendingUp, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock trend data for charts
    const trendData = [
        { name: 'Week 1', attendance: 65 },
        { name: 'Week 2', attendance: 72 },
        { name: 'Week 3', attendance: 68 },
        { name: 'Week 4', attendance: 78 },
        { name: 'Week 5', attendance: 85 },
        { name: 'Week 6', attendance: 82 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getStudentData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching student data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }} />
                <p style={{ color: '#64748b', fontWeight: '500' }}>Preparing your dashboard...</p>
            </div>
        );
    }

    const courses = data?.courses || [];
    const overallPercentage = data?.overall_percentage || 0;
    const onTrack = courses.filter(c => !c.shortage).length;
    const shortage = courses.filter(c => c.shortage).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Welcome back, {data?.student_info?.full_name || 'Student'}!</h1>
                    <p className="page-subtitle">Here's what's happening with your attendance today.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">
                        <Calendar size={18} />
                        Semester Schedule
                    </button>
                </div>
            </div>

            {/* Main Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '24px' }}>
                {/* Highlight Card */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    border: 'none',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>Overall Attendance</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '48px', fontWeight: '700', letterSpacing: '-0.025em' }}>
                                {overallPercentage}%
                            </span>
                            <span className="trend-up" style={{ color: '#a7f3d0', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '9999px' }}>
                                <ArrowUpRight size={14} /> +2.4%
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', marginTop: '16px', opacity: 0.9, lineHeight: '1.4' }}>
                            {overallPercentage >= 75
                                ? 'You are doing great! Keep it up to stay above the 75% requirement.'
                                : 'Caution: Your overall attendance is currently below the required threshold.'}
                        </p>
                    </div>
                    {/* Abstract background shape */}
                    <div style={{
                        position: 'absolute', right: '-20px', bottom: '-20px',
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)'
                    }} />
                </div>

                {/* Stat Cards */}
                <div className="stat-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            backgroundColor: '#eef2ff', color: '#4f46e5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <p className="stat-label">Enrolled Courses</p>
                            <p className="stat-value">{courses.length}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            backgroundColor: '#ecfdf5', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <p className="stat-label">On Track</p>
                            <p className="stat-value" style={{ color: '#059669' }}>{onTrack}</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            backgroundColor: '#fff1f2', color: '#f43f5e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertTriangle size={22} />
                        </div>
                        <div>
                            <p className="stat-label">Shortage Risks</p>
                            <p className="stat-value" style={{ color: '#e11d48' }}>{shortage}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart and Detail Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Trend Chart */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title">Attendance Trends</h2>
                        <select className="input-field" style={{ width: '120px', padding: '4px 8px', fontSize: '12px' }}>
                            <option>Last 30 days</option>
                            <option>Last semester</option>
                        </select>
                    </div>
                    <div className="chart-container" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#4f46e5"
                                    fillOpacity={1}
                                    fill="url(#colorAttend)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profile/Quick Info */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">My Profile</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '12px 0' }}>
                        <div className="avatar-lg" style={{ width: '80px', height: '80px', fontSize: '24px', backgroundColor: '#eef2ff' }}>
                            {data?.student_info?.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: '600', fontSize: '18px', color: '#0f172a' }}>
                                {data?.student_info?.full_name || 'Loading...'}
                            </p>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Roll: {data?.student_info?.roll_number}</p>
                        </div>
                        <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>Department</span>
                                <span style={{ fontWeight: '500', fontSize: '13px' }}>{data?.student_info?.department}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>Semester</span>
                                <span className="badge-info" style={{ padding: '2px 8px' }}>{data?.student_info?.semester}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Roster Grid */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Courses Enrollment</h2>
                    <button className="text-link" style={{ fontSize: '14px' }}>View All Courses</button>
                </div>

                {courses.length === 0 ? (
                    <div className="card empty-state">
                        <div className="empty-state-icon"><BookOpen size={32} /></div>
                        <p style={{ fontWeight: '600', color: '#0f172a' }}>No courses found</p>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Please contact admin to enroll in courses.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Course Information</th>
                                    <th>Attendance Status</th>
                                    <th>Performance</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course, idx) => (
                                    <tr key={idx} style={{ transition: 'all 200ms' }}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div className="avatar" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                    {course.course_code.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: '#0f172a' }}>{course.course_name}</p>
                                                    <p style={{ fontSize: '12px', color: '#64748b' }}>{course.course_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={course.shortage ? 'pill-badge pill-badge-danger' : 'pill-badge pill-badge-success'}>
                                                {course.shortage ? 'Shortage Alert' : 'On Track'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="progress-bar" style={{ width: '100px' }}>
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{
                                                            width: `${course.percentage}%`,
                                                            backgroundColor: course.shortage ? '#f43f5e' : '#10b981'
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ fontWeight: '600', minWidth: '40px', textAlign: 'right', fontSize: '13px' }}>
                                                    {course.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                View Records
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
