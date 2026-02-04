import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getStudentData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching student data", error);
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

    const courses = data?.courses || [];
    const overallPercentage = data?.overall_percentage || 0;
    const onTrack = courses.filter(c => !c.shortage).length;
    const shortage = courses.filter(c => c.shortage).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Your attendance overview</p>
            </div>

            {/* Overall Attendance Card */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: 'none',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                            Overall Attendance
                        </p>
                        <p style={{ fontSize: '48px', fontWeight: '600', letterSpacing: '-0.025em' }}>
                            {overallPercentage}%
                        </p>
                        <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
                            {overallPercentage >= 75
                                ? '✓ You are meeting the 75% requirement'
                                : '⚠ Below 75% minimum requirement'}
                        </p>
                    </div>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '8px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '32px', fontWeight: '700' }}>{overallPercentage}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#eef2ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BookOpen size={20} style={{ color: '#4f46e5' }} />
                        </div>
                        <div>
                            <p className="stat-value">{courses.length}</p>
                            <p className="stat-label">Total Courses</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUp size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <p className="stat-value">{onTrack}</p>
                            <p className="stat-label">On Track</p>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#fff1f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertTriangle size={20} style={{ color: '#f43f5e' }} />
                        </div>
                        <div>
                            <p className="stat-value">{shortage}</p>
                            <p className="stat-label">Shortage</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Course-wise Attendance</h2>
                </div>

                {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <BookOpen size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                        <p style={{ color: '#64748b' }}>No courses enrolled yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {courses.map((course, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '500', color: '#0f172a' }}>
                                        {course.course_name}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                        {course.course_code}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div style={{ width: '200px' }}>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${course.percentage}%`,
                                                    backgroundColor: course.shortage ? '#f43f5e' : '#10b981'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span style={{
                                        width: '50px',
                                        fontWeight: '600',
                                        color: course.shortage ? '#e11d48' : '#059669',
                                        textAlign: 'right'
                                    }}>
                                        {course.percentage}%
                                    </span>
                                    {course.shortage && (
                                        <span className="badge-danger">Low</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
