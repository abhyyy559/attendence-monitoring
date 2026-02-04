import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, TrendingDown } from 'lucide-react';

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <p style={{ color: '#64748b' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Shortage Alerts</h1>
                <p className="page-subtitle">Courses where your attendance is below 75%</p>
            </div>

            {courses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <AlertTriangle size={28} style={{ color: '#10b981' }} />
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>
                        No shortage alerts!
                    </p>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                        Your attendance is above 75% in all courses
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {courses.map((course, idx) => (
                        <div
                            key={idx}
                            className="card"
                            style={{
                                borderColor: '#fecaca',
                                backgroundColor: '#fef2f2'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    backgroundColor: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <TrendingDown size={22} style={{ color: '#e11d48' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: '600', color: '#0f172a' }}>
                                        {course.course_name}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                                        {course.course_code}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        marginTop: '16px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${course.percentage}%`,
                                                        backgroundColor: '#f43f5e'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span style={{
                                            fontWeight: '700',
                                            color: '#e11d48',
                                            fontSize: '18px'
                                        }}>
                                            {course.percentage}%
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#dc2626',
                                        marginTop: '12px',
                                        fontWeight: '500'
                                    }}>
                                        ⚠ You need to attend more classes to reach 75%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShortageAlerts;
