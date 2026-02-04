import { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen } from 'lucide-react';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/dashboard/student');
                setCourses(response.data.courses || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
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
                <h1 className="page-title">My Courses</h1>
                <p className="page-subtitle">Courses you are enrolled in</p>
            </div>

            {courses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <BookOpen size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>
                        No courses enrolled
                    </p>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                        Contact admin to enroll in courses
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    {courses.map((course, idx) => (
                        <div key={idx} className="card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
                                <span className={course.shortage ? 'badge-danger' : 'badge-success'}>
                                    {course.percentage}%
                                </span>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <h3 style={{ fontWeight: '600', color: '#0f172a' }}>
                                    {course.course_name}
                                </h3>
                                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                                    {course.course_code}
                                </p>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${course.percentage}%`,
                                            backgroundColor: course.shortage ? '#f43f5e' : '#10b981'
                                        }}
                                    />
                                </div>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginTop: '8px'
                                }}>
                                    {course.shortage ? 'Below 75% threshold' : 'On track'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
