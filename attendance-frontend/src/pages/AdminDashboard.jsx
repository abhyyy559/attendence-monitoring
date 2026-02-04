import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { Users, BookOpen, AlertTriangle, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <p style={{ color: '#64748b' }}>Loading...</p>
            </div>
        );
    }

    const stats = data?.stats || {};

    const statCards = [
        {
            label: 'Total Students',
            value: stats.total_students || 0,
            icon: Users,
            color: '#4f46e5',
            bg: '#eef2ff'
        },
        {
            label: 'Total Faculty',
            value: stats.total_faculty || 0,
            icon: UserCheck,
            color: '#10b981',
            bg: '#ecfdf5'
        },
        {
            label: 'Total Courses',
            value: stats.total_courses || 0,
            icon: BookOpen,
            color: '#8b5cf6',
            bg: '#f5f3ff'
        },
        {
            label: 'Shortage Alerts',
            value: stats.shortage_alerts || 0,
            icon: AlertTriangle,
            color: '#f59e0b',
            bg: '#fffbeb'
        },
    ];

    // Sample department data
    const departments = [
        { name: 'Computer Science', students: 450, attendance: 85 },
        { name: 'Mechanical Engineering', students: 380, attendance: 78 },
        { name: 'Electrical Engineering', students: 300, attendance: 74 },
        { name: 'Civil Engineering', students: 250, attendance: 82 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">System overview and management</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: stat.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={20} style={{ color: stat.color }} />
                                </div>
                                <div>
                                    <p className="stat-value">{stat.value}</p>
                                    <p className="stat-label">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Department Overview */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Department Attendance</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {departments.map((dept, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ minWidth: '200px' }}>
                                    <p style={{ fontWeight: '500', color: '#0f172a' }}>{dept.name}</p>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>{dept.students} students</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, marginLeft: '24px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${dept.attendance}%`,
                                                    backgroundColor: dept.attendance < 75 ? '#f59e0b' : '#10b981'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span style={{
                                        width: '45px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: dept.attendance < 75 ? '#d97706' : '#059669',
                                        textAlign: 'right'
                                    }}>
                                        {dept.attendance}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Quick Actions</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Generate Shortage Report
                        </button>
                        <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Export Attendance Data
                        </button>
                        <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Configure Thresholds
                        </button>
                        <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            Add New Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
