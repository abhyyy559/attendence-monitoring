import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/dashboard/faculty');
                setCourses(response.data.courses || []);
            } catch (error) {
                toast.error("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleCourseSelect = async (courseId) => {
        if (!courseId) {
            setSelectedCourse('');
            setStudents([]);
            return;
        }
        setSelectedCourse(courseId);
        setLoading(true);
        try {
            const response = await api.get(`/api/courses/${courseId}/students`);
            setStudents(response.data);

            const initial = {};
            response.data.forEach(s => initial[s.student_id] = 'present');
            setAttendance(initial);
        } catch (error) {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAll = (status) => {
        const updated = {};
        students.forEach(s => updated[s.student_id] = status);
        setAttendance(updated);
    };

    const handleSubmit = async () => {
        if (!selectedCourse) return;
        setSubmitting(true);
        try {
            const data = {
                course_id: selectedCourse,
                class_date: selectedDate,
                attendance_data: Object.keys(attendance).map(id => ({
                    student_id: id,
                    status: attendance[id]
                }))
            };
            await api.post('/api/attendance/bulk', data);
            toast.success("Attendance saved successfully");
            navigate('/');
        } catch (error) {
            toast.error("Failed to save attendance");
        } finally {
            setSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'present', label: 'Present', color: '#10b981' },
        { value: 'absent', label: 'Absent', color: '#f43f5e' },
        { value: 'late', label: 'Late', color: '#f59e0b' },
        { value: 'excused', label: 'Excused', color: '#6366f1' },
    ];

    if (loading && courses.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <p style={{ color: '#64748b' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link
                    to="/"
                    style={{
                        padding: '8px',
                        color: '#64748b',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 150ms'
                    }}
                >
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="page-title">Mark Attendance</h1>
                    <p className="page-subtitle">Select a course and mark student attendance</p>
                </div>
            </div>

            {/* Selection Form */}
            <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '24px', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#334155',
                            marginBottom: '8px'
                        }}>
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className="input-field"
                            style={{ cursor: 'pointer' }}
                        >
                            <option value="">Select a course</option>
                            {courses.map(c => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name} ({c.course_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#334155',
                            marginBottom: '8px'
                        }}>
                            Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="input-field"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => handleMarkAll('present')}
                            disabled={students.length === 0}
                            className="btn-secondary"
                            style={{ fontSize: '13px', padding: '8px 12px' }}
                        >
                            All Present
                        </button>
                        <button
                            onClick={() => handleMarkAll('absent')}
                            disabled={students.length === 0}
                            className="btn-secondary"
                            style={{ fontSize: '13px', padding: '8px 12px' }}
                        >
                            All Absent
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Table */}
            {selectedCourse && (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.student_id}>
                                    <td style={{ fontWeight: '500' }}>{student.roll_number}</td>
                                    <td>{student.full_name}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleStatusChange(student.student_id, option.value)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 150ms',
                                                        backgroundColor: attendance[student.student_id] === option.value
                                                            ? option.color
                                                            : '#f1f5f9',
                                                        color: attendance[student.student_id] === option.value
                                                            ? 'white'
                                                            : '#64748b'
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                                        No students enrolled in this course
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {students.length > 0 && (
                        <div style={{
                            padding: '16px 24px',
                            borderTop: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <Link to="/" className="btn-secondary">Cancel</Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn-primary"
                            >
                                <Check size={18} />
                                {submitting ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
