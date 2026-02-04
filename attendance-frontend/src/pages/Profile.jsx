import { useAuth } from '../context/AuthContext';
import { Mail, Phone, Building, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Your account information</p>
            </div>

            {/* Profile Card */}
            <div className="card">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '16px',
                        backgroundColor: '#eef2ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#4f46e5'
                    }}>
                        {user?.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a' }}>
                            {user?.full_name}
                        </h2>
                        <span className="badge-info" style={{ marginTop: '8px', textTransform: 'capitalize' }}>
                            {user?.role}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Mail size={18} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>Email</p>
                            <p style={{ fontWeight: '500', color: '#0f172a' }}>{user?.email}</p>
                        </div>
                    </div>

                    {user?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Phone size={18} style={{ color: '#64748b' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Phone</p>
                                <p style={{ fontWeight: '500', color: '#0f172a' }}>{user?.phone}</p>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shield size={18} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>Role</p>
                            <p style={{ fontWeight: '500', color: '#0f172a', textTransform: 'capitalize' }}>
                                {user?.role}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Card */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Account Settings</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                        Change Password
                    </button>
                    <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                        Update Profile Information
                    </button>
                    <button className="btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }}>
                        Notification Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
