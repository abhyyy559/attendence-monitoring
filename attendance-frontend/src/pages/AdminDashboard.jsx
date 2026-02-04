import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { Users, BookOpen, AlertTriangle, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
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
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const stats = [
        { label: 'Total Students', value: data?.stats?.total_students || 0, icon: Users, color: 'blue' },
        { label: 'Total Faculty', value: data?.stats?.total_faculty || 0, icon: UserCheck, color: 'green' },
        { label: 'Total Courses', value: data?.stats?.total_courses || 0, icon: BookOpen, color: 'purple' },
        { label: 'Shortage Alerts', value: data?.stats?.shortage_alerts || 0, icon: AlertTriangle, color: 'amber' },
    ];

    const departments = [
        { name: 'Computer Science', students: 450, attendance: 85 },
        { name: 'Mechanical Engineering', students: 380, attendance: 78 },
        { name: 'Electrical Engineering', students: 300, attendance: 74 },
        { name: 'Civil Engineering', students: 250, attendance: 82 },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">System overview and management</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    const bgColor = {
                        blue: 'bg-blue-100',
                        green: 'bg-green-100',
                        purple: 'bg-purple-100',
                        amber: 'bg-amber-100'
                    }[stat.color];
                    const textColor = {
                        blue: 'text-blue-600',
                        green: 'text-green-600',
                        purple: 'text-purple-600',
                        amber: 'text-amber-600'
                    }[stat.color];

                    return (
                        <div key={idx} className="card">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 ${bgColor} rounded-md`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Department Overview */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Department Attendance</h2>
                </div>
                <div className="space-y-4">
                    {departments.map((dept, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                                <p className="text-xs text-gray-500">{dept.students} students</p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <div className="w-32">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-bar-fill ${dept.attendance < 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${dept.attendance}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className={`text-sm font-medium w-12 text-right ${dept.attendance < 75 ? 'text-amber-600' : 'text-green-600'}`}>
                                    {dept.attendance}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                            Generate Shortage Report
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                            Export Attendance Data
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
                            Configure Thresholds
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Database</span>
                            <span className="badge-success">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">API Server</span>
                            <span className="badge-success">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Last Sync</span>
                            <span className="text-sm text-gray-500">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
