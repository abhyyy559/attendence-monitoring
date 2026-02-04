import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }

        setLoading(true);
        try {
            await api.post(`/api/auth/reset-password/${token}`, { password });
            setIsSuccess(true);
            toast.success("Security updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f8fafc', padding: '24px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        width: '100%', maxWidth: '440px', backgroundColor: 'white',
                        borderRadius: '24px', padding: '48px', textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5',
                        color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                        Password Reset
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>
                        Your institutional account credentials have been successfully updated. You can now sign in with your new password.
                    </p>
                    <Link to="/login" className="btn-primary" style={{
                        width: '100%', padding: '14px', borderRadius: '12px', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        Proceed to Login <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)', padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%', maxWidth: '440px', backgroundColor: 'white',
                    borderRadius: '24px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                        Create New Password
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '15px' }}>
                        Please choose a strong, unique password to secure your academic portal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="input-group">
                        <label className="label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="input-field"
                                style={{ paddingLeft: '48px', paddingRight: '48px', width: '100%' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                    border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="input-field"
                                style={{ paddingLeft: '48px', width: '100%' }}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{
                        width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px', marginTop: '8px'
                    }}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
