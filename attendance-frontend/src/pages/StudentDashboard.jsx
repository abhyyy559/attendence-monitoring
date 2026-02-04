import { useState, useEffect } from 'react';
import api, { dashboardService } from '../services/api';
import { BookOpen, TrendingUp, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [trendData, setTrendData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getStudentData();
                setData(response.data);

                // Fetch real trend data
                const trendResponse = await api.get('/api/students/trends');
                setTrendData(trendResponse.data);
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

    // Subject performance data for BarChart
    const subjectPerformance = courses.map(c => ({
        name: c.course_code,
        percentage: c.percentage,
        fullName: c.course_name
    })).sort((a, b) => b.percentage - a.percentage);

    // Filter shortage alerts
    const alerts = courses.filter(c => c.shortage);

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

            {/* Top Row: Big Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Overall Attendance */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    border: 'none', color: 'white', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>Overall Attendance</p>
                            <TrendingUp size={20} style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '42px', fontWeight: '800' }}>{overallPercentage}%</span>
                            <span style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                                On Track
                            </span>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '16px', opacity: 0.8 }}>Requirement: 75% minimum participation</p>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
                </div>

                {/* Shortage Alerts */}
                <div className="card" style={{
                    background: shortage > 0 ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none', color: 'white', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>Attendance Alerts</p>
                            <AlertTriangle size={20} style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '42px', fontWeight: '800' }}>{shortage}</span>
                            <span style={{ fontSize: '13px', opacity: 0.9 }}>Subjects in Red</span>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '16px', opacity: 0.8 }}>{shortage > 0 ? 'Urgent action required in some courses' : 'All courses meet minimum requirements'}</p>
                    </div>
                </div>

                {/* Next Predicted Class */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    border: 'none', color: 'white', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ fontSize: '14px', opacity: 0.9, fontWeight: '600' }}>Next Scheduled Class</p>
                            <Calendar size={20} style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '20px', fontWeight: '700' }}>Machine Learning</p>
                            <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>CS-402 | 10:30 AM Today</p>
                        </div>
                        <p style={{ fontSize: '12px', marginTop: '16px', color: '#94a3b8' }}>Room: Virtual Lab 102</p>
                    </div>
                </div>
            </div>

            {/* Middle Section: Analytics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Attendance Trend Line Chart */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title">Attendance Trend</h2>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '6px' }}>Daily Activity</span>
                    </div>
                    <div style={{ height: '300px', marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value}% Attendance`, 'Status']}
                                />
                                <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Performance Bar Chart */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Subject Performance</h2>
                    </div>
                    <div style={{ height: '300px', marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: '600' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                                    {subjectPerformance.map((entry, index) => (
                                        <Cell key={index} fill={entry.percentage < 75 ? '#f43f5e' : '#4f46e5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Alerts and Secondary Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title">Recent Shortage Alerts</h2>
                        <span className="pill-badge pill-badge-danger">{alerts.length} Flagged</span>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px dashed #22c55e' }}>
                                <p style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>Safe Zone: You have no active shortages.</p>
                            </div>
                        ) : (
                            alerts.map((a, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fff1f2', borderRadius: '10px', border: '1px solid #ffe4e6' }}>
                                    <div>
                                        <p style={{ fontWeight: '700', fontSize: '13px', color: '#e11d48' }}>{a.course_name}</p>
                                        <p style={{ fontSize: '11px', color: '#f43f5e' }}>{a.course_code} | Current: {a.percentage}%</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '11px', color: '#9f1239', fontWeight: '800' }}>{Math.ceil((0.75 * a.total_classes - a.attended) / (1 - 0.75) || 0)} More</p>
                                        <p style={{ fontSize: '10px', color: '#fb7185' }}>Classes Required</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title">Curriculum Health</h2>
                        <span className="pill-badge pill-badge-success">On Track</span>
                    </div>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="avatar-lg" style={{ backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '12px' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: '700' }}>{data?.student_info?.full_name}</p>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>{data?.student_info?.department} | Semester {data?.student_info?.semester}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Roll No</p>
                                <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>{data?.student_info?.roll_number}</p>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Academic Year</p>
                                <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>2023-2024</p>
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
