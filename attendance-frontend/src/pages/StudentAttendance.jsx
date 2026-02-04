import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // For now, show message about no data
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
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">View Attendance</h1>
                <p className="page-subtitle">Your attendance records across all courses</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Attendance Records</h2>
                </div>

                {attendance.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No attendance records yet</p>
                        <p className="text-sm text-gray-400 mt-1">Your attendance will appear here once marked by faculty</p>
                    </div>
                ) : (
                    <div className="table-container">
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
                                        <td>{record.date}</td>
                                        <td>{record.course}</td>
                                        <td>
                                            {record.status === 'present' && <span className="badge-success">Present</span>}
                                            {record.status === 'absent' && <span className="badge-danger">Absent</span>}
                                            {record.status === 'late' && <span className="badge-warning">Late</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
