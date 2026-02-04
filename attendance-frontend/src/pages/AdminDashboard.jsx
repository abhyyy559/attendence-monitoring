import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
    Users, BookOpen, AlertTriangle, UserCheck,
    ArrowUpRight, ArrowDownRight, Printer, Download, Settings, Plus,
    Activity, Clock, ChevronRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

    const deptAttendance = data?.dept_distribution || [];
    const coursePerformance = data?.course_performance || [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getAdminData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching admin dashboard data", error);
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
                <p style={{ color: '#64748b' }}>Accessing command center...</p>
            </div>
        );
    }

    const stats = data?.stats || {};
    const statCards = [
        { label: 'Total Students', value: stats.total_students || 0, trend: '+4.2%', icon: Users, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'Faculty Members', value: stats.total_faculty || 0, trend: '+0.5%', icon: UserCheck, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Active Courses', value: stats.total_courses || 0, trend: '+12%', icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Shortage Alerts', value: stats.shortage_alerts || 0, trend: '+2.1%', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in-up"
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Command Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">System Overview</h1>
                    <p className="page-subtitle">Unified dashboard for academic administration and monitoring.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">
                        <Download size={18} />
                        Export Data
                    </button>
                    <button className="btn-primary">
                        <Plus size={18} />
                        New Course
                    </button>
                </div>
            </div>

            {/* Stats Command Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
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
                                <span className="trend-up" style={{ fontSize: '11px' }}>
                                    {stat.trend} <ArrowUpRight size={12} />
                                </span>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <p className="stat-value">{stat.value}</p>
                                <p className="stat-label">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Visual Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Course Distribution Bar Chart */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h2 className="card-title">Attendance Performance by Course</h2>
                        <button className="text-link" style={{ fontSize: '12px' }}>Advanced View</button>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={coursePerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="present" name="Present %" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="absent" name="Absent %" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Distribution Donut */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Student Distribution</h2>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deptAttendance}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {deptAttendance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row Activity & Management */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
                {/* Tables & Management */}
                <div className="table-container">
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Recent Activity Log</h2>
                        <button className="text-link" style={{ fontSize: '13px' }}>Clear Log</button>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Activity Type</th>
                                <th>Performed By</th>
                                <th>Timestamp</th>
                                <th style={{ textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Activity size={14} style={{ color: '#64748b' }} />
                                            </div>
                                            <span style={{ fontWeight: '500' }}>Attendance Marked: CS102</span>
                                        </div>
                                    </td>
                                    <td>Prof. Kumar S.</td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>2 hrs ago</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className="badge-success">Success</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* System Tasks */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} style={{ color: '#6366f1' }} />
                        <h2 className="card-title">Pending Maintenance</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <div style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '600' }}>Semester Sync</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Last sync 4 days ago</p>
                            </div>
                            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>Run Now</button>
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '600' }}>Backup Database</p>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Daily backup pending</p>
                            </div>
                            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>Backup</button>
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '600' }}>System Update</p>
                                <p style={{ fontSize: '11px', color: '#10b981' }}>Latest version installed</p>
                            </div>
                            <Settings size={16} style={{ color: '#94a3b8' }} />
                        </div>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '24px' }}>
                        View All System Logs
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
