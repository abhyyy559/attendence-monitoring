import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { BookOpen, Users, CheckCircle } from 'lucide-react';

const FacultyDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getFacultyData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching faculty data", error);
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
    const totalStudents = courses.reduce((acc, c) => acc + (c.student_count || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        {data?.faculty_info?.department || 'Department'} • {data?.faculty_info?.employee_id || 'Faculty'}
                    </p>
                </div>
                <Link to="/mark-attendance" className="btn-primary">
                    Mark Attendance
                </Link>
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
                            <p className="stat-label">Assigned Courses</p>
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
                            <Users size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <p className="stat-value">{totalStudents}</p>
                            <p className="stat-label">Total Students</p>
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
                            <CheckCircle size={20} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <p className="stat-value" style={{ color: '#10b981' }}>Active</p>
                            <p className="stat-label">Status</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Table */}
            <div className="table-container">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                        Your Courses
                    </h2>
                </div>

                {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                        <BookOpen size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                        <p style={{ color: '#64748b' }}>No courses assigned yet</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Students</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: '500' }}>{course.course_code}</td>
                                    <td>{course.course_name}</td>
                                    <td>
                                        <span className="badge-info">{course.student_count} enrolled</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link
                                            to={`/mark-attendance?course=${course.course_id}`}
                                            className="text-link"
                                            style={{ fontSize: '14px' }}
                                        >
                                            Mark Attendance →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
