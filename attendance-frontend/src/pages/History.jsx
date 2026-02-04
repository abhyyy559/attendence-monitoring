import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, History as HistoryIcon, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const History = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const endpoint = user.role === 'student' ? '/api/students/attendance' : '/api/faculty/history';
                const response = await api.get(endpoint);
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
                toast.error("Timeline synchronization failed.");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchHistory();
    }, [user]);

    const filteredHistory = history
        .filter(item => {
        if (filter === 'all') return true;
        if (user.role === 'student') return item.status === filter;
        return true; // Faculty history doesn't have status filter yet in this simple impl
        })
        .filter(item => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            if (user.role === 'student') {
                return (
                    (item.course || '').toLowerCase().includes(q) ||
                    (item.faculty || '').toLowerCase().includes(q)
                );
            }
            return (
                (item.course_name || '').toLowerCase().includes(q) ||
                (item.course_code || '').toLowerCase().includes(q)
            );
        });

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }} />
                <p style={{ color: '#64748b' }}>Retrieving archival records...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">{user.role === 'faculty' ? 'Marking Logbook' : 'Attendance Timeline'}</h1>
                    <p className="page-subtitle">Unified chronological record of academic sessions.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {user.role === 'student' && ['all', 'present', 'absent', 'late'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`badge-${filter === s ? 'info' : 'secondary'}`}
                                style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', textTransform: 'capitalize' }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder={user.role === 'student' ? 'Search course/faculty...' : 'Search course/code...'}
                            className="input-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', width: '100%', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Session Date</th>
                                <th>Subject / Course</th>
                                <th>{user.role === 'student' ? 'Faculty' : 'Students Marked'}</th>
                                <th style={{ textAlign: 'right' }}>{user.role === 'student' ? 'Status' : 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Calendar size={14} style={{ color: '#64748b' }} />
                                            <span style={{ fontWeight: '600' }}>{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: '700' }}>{user.role === 'student' ? item.course : item.course_name}</p>
                                            <p style={{ fontSize: '11px', color: '#94a3b8' }}>{user.role === 'student' ? 'Verified Session' : item.course_code}</p>
                                        </div>
                                    </td>
                                    <td>
                                        {user.role === 'student' ? (
                                            <span style={{ fontSize: '14px', color: '#64748b' }}>{item.faculty}</span>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <UserCheck size={14} style={{ color: '#10b981' }} />
                                                <span style={{ fontWeight: '700' }}>{item.marked_count}</span>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>Submissions</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {user.role === 'student' ? (
                                            <span className={`pill-badge pill-badge-${item.status === 'present' ? 'success' : item.status === 'absent' ? 'danger' : 'warning'}`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        ) : (
                                            <Link to={`/mark-attendance?course=${item.course_id}&date=${item.date}`} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                                                Re-open Session <ArrowRight size={12} />
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredHistory.length === 0 && (
                        <div className="empty-state" style={{ padding: '40px' }}>
                            <HistoryIcon size={32} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                            <p style={{ color: '#64748b' }}>No archival records found for the current selection.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default History;
