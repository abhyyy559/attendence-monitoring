import Sidebar from './Sidebar';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, HelpCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast.success("All caught up!");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar />

            <div style={{
                flex: 1,
                marginLeft: '260px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Global Top Navbar */}
                <header style={{
                    height: '70px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #edf2f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Universal search (Alt + K)..."
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 40px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '13px',
                                backgroundColor: '#f1f5f9'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button className="btn-secondary" style={{ border: 'none', padding: '8px' }}>
                            <HelpCircle size={20} color="#64748b" />
                        </button>

                        <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }} />

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    position: 'relative',
                                    padding: '10px',
                                    color: showNotifications ? '#4f46e5' : '#64748b',
                                    background: showNotifications ? '#f5f3ff' : '#f8fafc',
                                    border: '1px solid',
                                    borderColor: showNotifications ? '#ddd6fe' : '#e2e8f0',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 200ms'
                                }}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        width: '18px',
                                        height: '18px',
                                        backgroundColor: '#f43f5e',
                                        color: 'white',
                                        borderRadius: '50%',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(244, 63, 94, 0.3)'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '12px',
                                            width: '360px',
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                                            border: '1px solid #e2e8f0',
                                            zIndex: 50,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Recent Alerts</h3>
                                            <button
                                                onClick={handleMarkAllRead}
                                                style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
                                            >
                                                Mark all read
                                            </button>
                                        </div>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                        <CheckCircle size={24} />
                                                    </div>
                                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>All caught up!</p>
                                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>No new notifications found.</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.notification_id}
                                                        style={{
                                                            padding: '16px',
                                                            borderBottom: '1px solid #f1f5f9',
                                                            backgroundColor: n.is_read ? 'transparent' : '#f5f3ff',
                                                            transition: 'background-color 200ms'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{
                                                                width: '32px', height: '32px', borderRadius: '8px',
                                                                backgroundColor: n.type === 'shortage' ? '#fff1f2' : n.type === 'info' ? '#e0f2fe' : '#f0fdf4',
                                                                color: n.type === 'shortage' ? '#f43f5e' : n.type === 'info' ? '#0ea5e9' : '#22c55e',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                            }}>
                                                                {n.type === 'shortage' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{n.title}</p>
                                                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>{n.message}</p>
                                                                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
                                                                    {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <ProfileDropdown />
                    </div>
                </header>

                {/* Content Viewport */}
                <main style={{
                    padding: '40px',
                    maxWidth: '1400px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
