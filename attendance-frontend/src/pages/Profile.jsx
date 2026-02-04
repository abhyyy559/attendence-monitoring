import { useAuth } from '../context/AuthContext';
import { Mail, Phone, Building, Shield, Settings, Key, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, logout } = useAuth();

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
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Key size={18} />
                                    <span>Change Access Password</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Bell size={18} />
                                    <span>Notification Control</span>
                                </div>
                                <ChevronRight size={16} />
                            </button>
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
