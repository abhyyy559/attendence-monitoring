import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, Download, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Mocking data for visual demonstration
                const mockData = [
                    { id: 1, date: '2024-02-03', course: 'Computer Science 101', status: 'present', faculty: 'Dr. Smith' },
                    { id: 2, date: '2024-02-02', course: 'Mathematics II', status: 'absent', faculty: 'Prof. Johnson' },
                    { id: 3, date: '2024-02-01', course: 'Physics Lab', status: 'late', faculty: 'Dr. Lee' },
                    { id: 4, date: '2024-01-31', course: 'Computer Science 101', status: 'present', faculty: 'Dr. Smith' },
                ];
                setAttendance(mockData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const filteredData = attendance.filter(item =>
        filter === 'all' ? true : item.status === filter
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Reconstructing session timeline...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Attendance Timeline</h1>
                    <p className="page-subtitle">Chronological record of your academic presence.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary">
                        <Download size={18} />
                        Export Log
                    </button>
                    <button className="btn-primary">
                        <Calendar size={18} />
                        Calendar View
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="table-container">
                {/* Toolbar */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #edf2f7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['all', 'present', 'absent', 'late'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 200ms',
                                    backgroundColor: filter === s ? '#4f46e5' : 'transparent',
                                    color: filter === s ? 'white' : '#64748b'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                        <Filter size={16} />
                        Showing {filteredData.length} records
                    </div>
                </div>

                {filteredData.length === 0 ? (
                    <div className="card empty-state" style={{ border: 'none' }}>
                        <div className="empty-state-icon"><Calendar size={32} /></div>
                        <h3 style={{ fontWeight: '600', color: '#1e293b' }}>No records in this category</h3>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Try changing the filters or check back later.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '180px' }}>Session Date</th>
                                    <th>Course Identification</th>
                                    <th>Faculty Member</th>
                                    <th style={{ textAlign: 'right' }}>Status Pillar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredData.map((record, idx) => (
                                        <motion.tr
                                            key={record.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        backgroundColor: record.status === 'present' ? '#10b981' : record.status === 'absent' ? '#f43f5e' : '#f59e0b'
                                                    }} />
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: '#0f172a' }}>{record.course}</p>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Regular Lecture</p>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px', border: 'none' }}>
                                                        {record.faculty.charAt(record.faculty.indexOf(' ') + 1)}
                                                    </div>
                                                    <span style={{ fontSize: '14px', color: '#64748b' }}>{record.faculty}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className={`pill-badge ${record.status === 'present' ? 'pill-badge-success' : record.status === 'absent' ? 'pill-badge-danger' : 'pill-badge-warning'}`}>
                                                    {record.status === 'present' ? <CheckCircle size={12} style={{ marginRight: '4px' }} /> :
                                                        record.status === 'absent' ? <XCircle size={12} style={{ marginRight: '4px' }} /> :
                                                            <Clock size={12} style={{ marginRight: '4px' }} />}
                                                    {record.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ padding: '24px', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'center' }}>
                    <button className="text-link" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Load More Entries <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentAttendance;
