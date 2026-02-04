import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        role: 'student',
        semester: 1
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone || null,
                role: formData.role,
                semester: formData.role === 'student' ? parseInt(formData.semester) : null
            });
            toast.success('Onboarding complete! You can now sign in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid', gridTemplateColumns: 'minmax(450px, 50%) 1fr',
            backgroundColor: 'white'
        }}>
            {/* Form Section */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 80px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}
                >
                    <Link to="/login" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#64748b', textDecoration: 'none', marginBottom: '32px',
                        fontSize: '14px', fontWeight: '600'
                    }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>

                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Join AttendLink</h1>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Start your journey with our intelligent attendance platform.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Full Legal Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" required className="input-field" style={{ paddingLeft: '44px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Account Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="input-field" style={{ cursor: 'pointer' }}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                </select>
                            </div>
                        </div>

                        {formData.role === 'student' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}
                            >
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Current Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <option key={s} value={s}>Semester {s}</option>
                                    ))}
                                </select>
                            </motion.div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Institutional Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@university.edu" required className="input-field" style={{ paddingLeft: '44px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Contact Number (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input-field" style={{ paddingLeft: '44px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Secure Pass</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="input-field" style={{ paddingLeft: '44px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Confirm Key</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required className="input-field" style={{ paddingLeft: '44px' }} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', height: '52px', marginTop: '16px', fontSize: '16px', gap: '12px' }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                            {loading ? 'Creating Identity...' : 'Register as ' + (formData.role === 'student' ? 'Student' : 'Faculty')}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Visual Section */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)'
                }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}
                >
                    <div style={{
                        width: '72px', height: '72px', backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px', margin: '0 auto 24px', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Sparkles size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Accelerate Your Learning.</h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '40px' }}>
                        Join thousands of students and educators using AttendLink to optimize academic participation.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <p style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>Real-time sync with academic servers</p>
                        </div>
                        <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            <p style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>Automated shortage forecasting</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
