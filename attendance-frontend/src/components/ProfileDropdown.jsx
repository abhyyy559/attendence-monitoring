import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, ChevronDown, Shield, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initials and Color
    const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    const bgColors = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];
    const userBg = bgColors[initials.charCodeAt(0) % bgColors.length];

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: isOpen ? '#f1f5f9' : 'transparent',
                    transition: 'all 200ms'
                }}
            >
                <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{user?.full_name}</p>
                    <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.05em' }}>
                        {user?.role}
                    </p>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: userBg,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {initials}
                </div>
                <ChevronDown size={16} style={{
                    color: '#94a3b8',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 200ms'
                }} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '12px',
                            width: '240px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                            border: '1px solid #e2e8f0',
                            padding: '8px',
                            zIndex: 100
                        }}
                    >
                        <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                                <Mail size={14} /> {user?.email}
                            </div>
                        </div>

                        <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                            <div className="dropdown-icon-wrapper"><User size={18} /></div>
                            <span>My Profile</span>
                        </Link>

                        <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>
                            <div className="dropdown-icon-wrapper"><Settings size={18} /></div>
                            <span>Settings</span>
                        </Link>

                        <div style={{ margin: '8px 0', borderTop: '1px solid #f1f5f9' }} />

                        <button
                            onClick={handleLogout}
                            className="dropdown-item"
                            style={{ width: '100%', color: '#f43f5e', border: 'none', background: 'none' }}
                        >
                            <div className="dropdown-icon-wrapper" style={{ backgroundColor: '#fff1f2', color: '#f43f5e' }}>
                                <LogOut size={18} />
                            </div>
                            <span style={{ fontWeight: '600' }}>Logout Session</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
