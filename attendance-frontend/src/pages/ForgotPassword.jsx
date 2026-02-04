import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success("Security token generated!");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Could not process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle at top left, #f8fafc 0%, #e2e8f0 100%)',
            padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%', maxWidth: '440px', backgroundColor: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '24px', padding: '48px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <Link to="/login" style={{
                    display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b',
                    fontSize: '14px', textDecoration: 'none', marginBottom: '32px'
                }}>
                    <ArrowLeft size={16} /> Back to Sign In
                </Link>

                {!submitted ? (
                    <>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                            Reset your password
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>
                            Enter your institutional email address and we'll send you a secure link to reset your credentials.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                                    Institutional Email
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: '48px', width: '100%' }}
                                        placeholder="name@college.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{
                                width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px'
                            }}>
                                {loading ? 'Processing...' : (
                                    <>
                                        Send Reset Link <Send size={18} style={{ marginLeft: '8px' }} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5',
                            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                            Check your console
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>
                            Since we use a mock email service, the reset link has been printed to the **backend terminal**. Please check there to continue.
                        </p>
                        <button onClick={() => setSubmitted(false)} className="text-link">
                            Submit another email
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
