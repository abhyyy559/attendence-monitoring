import { useAuth } from '../context/AuthContext';
import { Mail, Phone, Building, Shield, Settings, Key, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, logout } = useAuth();
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [savingNotifications, setSavingNotifications] = useState(false);

    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const res = await api.get('/api/auth/notifications');
                setNotificationsEnabled(!!res.data.enabled);
            } catch {
                // Keep default true
            }
        };
        loadPrefs();
    }, []);

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }
        setSavingPassword(true);
        try {
            await api.put('/api/auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            toast.success("Password updated");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    const toggleNotifications = async (enabled) => {
        setNotificationsEnabled(enabled);
        setSavingNotifications(true);
        try {
            await api.put('/api/auth/notifications', { enabled });
            toast.success("Notification preference saved");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Failed to save preference");
            setNotificationsEnabled(!enabled); // revert on failure
        } finally {
            setSavingNotifications(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}
        >
            {/* Page Header */}
            <div>
                <h1 className="page-title">Personal Identity</h1>
                <p className="page-subtitle">Manage your personal information and security settings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                {/* Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                            <div className="avatar-lg" style={{
                                width: '100px', height: '100px', fontSize: '36px',
                                backgroundColor: '#eef2ff', color: '#4f46e5',
                                margin: '0 auto', border: '4px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}>
                                {user?.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <button style={{
                                position: 'absolute', bottom: '0', right: '0',
                                width: '32px', height: '32px', borderRadius: '50%',
                                backgroundColor: 'white', border: '1px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#64748b'
                            }}>
                                <Settings size={16} />
                            </button>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{user?.full_name}</h2>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{user?.email}</p>
                        <div style={{ marginTop: '16px' }}>
                            <span className="pill-badge pill-badge-success" style={{ padding: '4px 12px' }}>
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <button className="btn-danger" style={{ width: '100%', gap: '10px' }} onClick={logout}>
                            <LogOut size={18} />
                            Sign Out Account
                        </button>
                    </div>
                </div>

                {/* Details Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Information Details</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="empty-state-icon" style={{ width: '40px', height: '40px', marginBottom: 0 }}>
                                    <Mail size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Primary Email</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{user?.email}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="empty-state-icon" style={{ width: '40px', height: '40px', marginBottom: 0 }}>
                                    <Shield size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Account Role</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>{user?.role}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="empty-state-icon" style={{ width: '40px', height: '40px', marginBottom: 0 }}>
                                    <UserIcon size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Unique Identifier</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>#{user?.user_id?.substring(0, 8) || 'USR-8291'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Security & Preferences</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                onClick={() => { setShowPasswordForm(v => !v); setShowNotifications(false); }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Key size={18} />
                                    <span>Change Access Password</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            {showPasswordForm && (
                                <form onSubmit={submitPasswordChange} className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>OLD PASSWORD</label>
                                            <input type="password" className="input-field" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
                                            <input type="password" className="input-field" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
                                            <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                        </div>
                                        <button className="btn-primary" type="submit" disabled={savingPassword}>
                                            {savingPassword ? 'Saving...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <button
                                className="btn-secondary"
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                onClick={() => { setShowNotifications(v => !v); setShowPasswordForm(false); }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Bell size={18} />
                                    <span>Notification Control</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            {showNotifications && (
                                <div className="card" style={{ padding: '16px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>Enable Notifications</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>Turn alerts and reminders on/off.</p>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={notificationsEnabled}
                                            disabled={savingNotifications}
                                            onChange={(e) => toggleNotifications(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{notificationsEnabled ? 'On' : 'Off'}</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ChevronRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default Profile;
