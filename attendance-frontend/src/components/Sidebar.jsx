import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    AlertTriangle,
    FileText,
    User,
    Users,
    Settings,
    LogOut,
    CheckSquare
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/attendance', icon: Calendar, label: 'Attendance' },
        { to: '/student/courses', icon: BookOpen, label: 'Courses' },
        { to: '/student/shortage', icon: AlertTriangle, label: 'Shortage Alerts' },
        { to: '/student/reports', icon: FileText, label: 'Reports' },
    ];

    const facultyLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/mark-attendance', icon: CheckSquare, label: 'Mark Attendance' },
        { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/faculty/history', icon: Calendar, label: 'History' },
    ];

    const adminLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { to: '/admin/threshold', icon: Settings, label: 'Thresholds' },
        { to: '/admin/reports', icon: FileText, label: 'Reports' },
    ];

    const links = user?.role === 'admin'
        ? adminLinks
        : user?.role === 'faculty'
            ? facultyLinks
            : studentLinks;

    return (
        <div className="sidebar">
            {/* Logo */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0f172a',
                    letterSpacing: '-0.025em'
                }}>
                    Attendance
                </h1>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) =>
                                isActive ? 'sidebar-item-active' : 'sidebar-item'
                            }
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Section */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #e2e8f0'
            }}>
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-item-active' : 'sidebar-item'
                    }
                    style={{ marginBottom: '8px' }}
                >
                    <User size={18} />
                    <span>Profile</span>
                </NavLink>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginTop: '8px'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4f46e5',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                        {user?.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.full_name}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            textTransform: 'capitalize'
                        }}>
                            {user?.role}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px',
                            color: '#64748b',
                            background: 'none',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 150ms'
                        }}
                        title="Sign out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
