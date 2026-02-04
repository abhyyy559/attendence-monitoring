import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, TrendingDown, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShortageAlerts = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/api/dashboard/student');
                const shortages = (response.data.courses || []).filter(c => c.shortage);
                setCourses(shortages);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#f43f5e', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Checking shortage status...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Shortage Alerts</h1>
                    <p className="page-subtitle">Critical courses requiring immediate attendance improvement.</p>
                </div>
                <div className="badge-danger" style={{ padding: '8px 16px', borderRadius: '10px' }}>
                    Critical Threshold: 75%
                </div>
            </div>

            <AnimatePresence>
                {courses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card empty-state"
                        style={{ border: '1px dashed #e2e8f0' }}
                    >
                        <div className="empty-state-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>All Clear!</h2>
                        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px' }}>
                            Awesome! You don't have any shortage alerts. Keep maintaining this consistency!
                        </p>
                        <button className="btn-primary" style={{ marginTop: '12px', backgroundColor: '#10b981' }}>
                            View Full Attendance
                        </button>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {courses.map((course, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="card"
                                style={{
                                    borderLeft: '4px solid #f43f5e',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        backgroundColor: '#fff1f2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <ShieldAlert size={28} style={{ color: '#e11d48' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                                                    {course.course_name}
                                                </h3>
                                                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                                    {course.course_code}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '24px', fontWeight: '800', color: '#e11d48' }}>
                                                    {course.percentage}%
                                                </span>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                                                    Current Status
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <div className="progress-bar" style={{ height: '8px', backgroundColor: '#f1f5f9' }}>
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${course.percentage}%`,
                                                        backgroundColor: '#f43f5e',
                                                        boxShadow: '0 0 8px rgba(244, 63, 94, 0.3)'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                                <span style={{ fontSize: '12px', color: '#f43f5e', fontWeight: '600' }}>
                                                    Below 75% threshold
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                    Target: 75%
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: '24px',
                                            padding: '12px 16px',
                                            backgroundColor: '#fef2f2',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <TrendingDown size={18} style={{ color: '#e11d48' }} />
                                                <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500' }}>
                                                    You need to attend the next 4 classes to reach 75%.
                                                </span>
                                            </div>
                                            <button className="text-link" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Plan Recovery <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ShortageAlerts;
