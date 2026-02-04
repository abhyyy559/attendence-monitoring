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
    UserCheck,
    Bell,
    ShieldCheck
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
        { to: '/student/attendance', icon: UserCheck, label: 'Attendance' },
        { to: '/student/courses', icon: BookOpen, label: 'Courses' },
        { to: '/student/shortage', icon: AlertTriangle, label: 'Shortage Alerts' },
        { to: '/student/reports', icon: FileText, label: 'Reports' },
    ];

    const facultyLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/mark-attendance', icon: UserCheck, label: 'Mark Attendance' },
        { to: '/faculty/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/faculty/history', icon: Calendar, label: 'Session History' },
    ];

    const adminLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/courses', icon: BookOpen, label: 'Course Directory' },
        { to: '/admin/threshold', icon: ShieldCheck, label: 'Policy Settings' },
        { to: '/admin/reports', icon: FileText, label: 'Analytics' },
    ];

    const links = user?.role === 'admin'
        ? adminLinks
        : user?.role === 'faculty'
            ? facultyLinks
            : studentLinks;

    return (
        <div className="sidebar" style={{
            boxShadow: '4px 0 24px -10px rgba(0,0,0,0.05)',
            zIndex: 50
        }}>
            {/* Logo Section */}
            <div style={{
                padding: '32px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                    A
                </div>
                <h1 style={{
                    fontSize: '19px',
                    fontWeight: '700',
                    color: '#0f172a',
                    letterSpacing: '-0.025em'
                }}>
                    AttendLink
                </h1>
            </div>

            {/* Navigation Section */}
            <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                <p style={{
                    padding: '0 12px 12px 12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Main Navigation
                </p>
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
                            style={({ isActive }) => ({
                                marginBottom: '4px',
                                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                ...(isActive ? {
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    fontWeight: '600'
                                } : {})
                            })}
                        >
                            <Icon size={19} />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{
                padding: '16px 12px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc'
            }}>
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive ? 'sidebar-item-active' : 'sidebar-item'
                    }
                    style={{ marginBottom: '12px' }}
                >
                    <User size={19} />
                    <span>My Profile</span>
                </NavLink>

                {/* Profile Widget */}
                <div style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4f46e5',
                        fontWeight: '700',
                        fontSize: '15px'
                    }}>
                        {user?.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.full_name}
                        </p>
                        <p style={{
                            fontSize: '11px',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            letterSpacing: '0.025em'
                        }}>
                            {user?.role}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px',
                            color: '#94a3b8',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 200ms'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
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
