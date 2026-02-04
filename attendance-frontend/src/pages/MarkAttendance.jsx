import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

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
                setCourses(response.data.courses);
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

    if (loading && courses.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center space-x-4">
                <Link to="/" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="page-title">Mark Attendance</h1>
                    <p className="page-subtitle">Select a course and mark student attendance</p>
                </div>
            </div>

            {/* Selection Form */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className="input-field"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="input-field"
                        />
                    </div>

                    <div className="flex items-end space-x-2">
                        <button
                            onClick={() => handleMarkAll('present')}
                            disabled={students.length === 0}
                            className="btn-secondary text-xs"
                        >
                            Mark All Present
                        </button>
                        <button
                            onClick={() => handleMarkAll('absent')}
                            disabled={students.length === 0}
                            className="btn-secondary text-xs"
                        >
                            Mark All Absent
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
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.student_id}>
                                    <td className="font-medium">{student.roll_number}</td>
                                    <td>{student.full_name}</td>
                                    <td>
                                        <div className="flex items-center space-x-4">
                                            {['present', 'absent', 'late', 'excused'].map((status) => (
                                                <label key={status} className="flex items-center space-x-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`status-${student.student_id}`}
                                                        value={status}
                                                        checked={attendance[student.student_id] === status}
                                                        onChange={() => handleStatusChange(student.student_id, status)}
                                                        className="text-blue-600"
                                                    />
                                                    <span className="text-sm capitalize">{status}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            placeholder="Optional"
                                            className="input-field py-1 text-sm"
                                        />
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-500 py-8">
                                        No students enrolled in this course
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {students.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <Link to="/" className="btn-secondary">Cancel</Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn-primary"
                            >
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
