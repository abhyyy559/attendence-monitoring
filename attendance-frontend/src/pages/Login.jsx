import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back!");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: 'minmax(400px, 45%) 1fr',
            backgroundColor: 'white'
        }}>
            {/* Left Section - Form */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '40px 80px',
                backgroundColor: 'white'
            }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
                        }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.025em', color: '#0f172a' }}>AttendLink</h2>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Welcome Back</h1>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Enter your credentials to access the academic portal.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Institutional Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@university.edu"
                                    required
                                    className="input-field"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Security Password</label>
                                <a href="#" style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>Forgot Security Key?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-field"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                height: '52px',
                                marginTop: '8px',
                                fontSize: '16px',
                                gap: '12px',
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                            {loading ? 'Authenticating...' : 'Sign In Now'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#64748b' }}>
                        Need an institutional account?{' '}
                        <Link to="/register" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>Contact Registrar</Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Section - Visual Branding */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-5%', left: '-5%', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(60px)'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px' }}
                >
                    <div style={{
                        width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '24px', margin: '0 auto 32px', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <ShieldCheck size={40} color="white" />
                    </div>
                    <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '20px', lineHeight: '1.2' }}>
                        The Future of Academic Governance is Here.
                    </h2>
                    <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                        AttendLink provides an intelligent, automated attendance ecosystem designed for modern educational institutions.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '48px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>99.9%</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>Precision Tracking</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>Ready</p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' }}>GDPR Compliant</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
