import { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Users, Clock, ArrowRight, Book, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredCourses = courses.filter(c =>
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Loading curriculum...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Enrolled Courses</h1>
                    <p className="page-subtitle">Academic roadmap and participation metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Find course..."
                            className="input-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', width: '240px', fontSize: '13px' }}
                        />
                    </div>
                    <button className="btn-secondary">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Courses Visual Grid */}
            {filteredCourses.length === 0 ? (
                <div className="card empty-state" style={{ border: '1px dashed #ced4da' }}>
                    <div className="empty-state-icon"><Book size={32} /></div>
                    <h3 style={{ fontWeight: '600', color: '#1e293b' }}>No courses found</h3>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>We couldn't find any courses matching your selection.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredCourses.map((course, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer',
                                borderBottom: course.shortage ? '4px solid #f43f5e' : '1px solid #e2e8f0'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    backgroundColor: course.shortage ? '#fff1f2' : '#eef2ff',
                                    color: course.shortage ? '#f43f5e' : '#4f46e5',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <BookOpen size={24} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: '800',
                                        color: course.shortage ? '#e11d48' : '#0f172a'
                                    }}>
                                        {course.percentage}%
                                    </span>
                                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Participation</p>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                                    {course.course_name}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>{course.course_code}</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="progress-bar" style={{ height: '6px' }}>
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${course.percentage}%`,
                                            backgroundColor: course.shortage ? '#f43f5e' : '#4f46e5'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '11px', color: course.shortage ? '#f43f5e' : '#10b981', fontWeight: '600' }}>
                                        {course.shortage ? 'Action Required' : 'On Track'}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Req: 75%</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '8px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={14} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>42 Students</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={14} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{course.percentage > 0 ? 'Active' : 'Not Started'}</span>
                                    </div>
                                </div>
                                <ArrowRight size={16} style={{ color: '#cbd5e1' }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default StudentCourses;
