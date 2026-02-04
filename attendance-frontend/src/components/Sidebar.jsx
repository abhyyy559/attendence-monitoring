import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    User,
    BookOpen,
    CheckSquare,
    AlertTriangle,
    FileText,
    Users,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getMenuItems = () => {
        const base = [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
            { name: 'Profile', icon: User, path: '/profile' },
        ];

        if (user?.role === 'student') {
            return [
                ...base,
                { name: 'Attendance', icon: CheckSquare, path: '/student/attendance' },
                { name: 'Courses', icon: BookOpen, path: '/student/courses' },
                { name: 'Shortage Alerts', icon: AlertTriangle, path: '/student/shortage' },
                { name: 'Reports', icon: FileText, path: '/student/reports' },
            ];
        }

        if (user?.role === 'faculty') {
            return [
                ...base,
                { name: 'Mark Attendance', icon: CheckSquare, path: '/mark-attendance' },
                { name: 'My Courses', icon: BookOpen, path: '/faculty/courses' },
                { name: 'History', icon: FileText, path: '/faculty/history' },
            ];
        }

        if (user?.role === 'admin') {
            return [
                ...base,
                { name: 'Users', icon: Users, path: '/admin/users' },
                { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
                { name: 'Thresholds', icon: Settings, path: '/admin/threshold' },
                { name: 'Reports', icon: FileText, path: '/admin/reports' },
            ];
        }

        return base;
    };

    const menuItems = getMenuItems();

    return (
        <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900">Attendance System</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
                        >
                            <Icon size={18} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {user?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <LogOut size={16} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
