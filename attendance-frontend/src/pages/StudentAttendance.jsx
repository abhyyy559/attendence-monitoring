import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // For now, show empty state
                setAttendance([]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
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
                <h1 className="page-title">Attendance History</h1>
                <p className="page-subtitle">Your attendance records across all courses</p>
            </div>

            {/* Table */}
            <div className="table-container">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                        Recent Records
                    </h2>
                </div>

                {attendance.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <Calendar size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#0f172a' }}>
                            No attendance records yet
                        </p>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                            Your attendance will appear here once marked by faculty
                        </p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Course</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: '500' }}>{record.date}</td>
                                    <td>{record.course}</td>
                                    <td>
                                        {record.status === 'present' && (
                                            <span className="badge-success">
                                                <CheckCircle size={14} style={{ marginRight: '4px' }} />
                                                Present
                                            </span>
                                        )}
                                        {record.status === 'absent' && (
                                            <span className="badge-danger">
                                                <XCircle size={14} style={{ marginRight: '4px' }} />
                                                Absent
                                            </span>
                                        )}
                                        {record.status === 'late' && (
                                            <span className="badge-warning">
                                                <Clock size={14} style={{ marginRight: '4px' }} />
                                                Late
                                            </span>
                                        )}
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

export default StudentAttendance;
