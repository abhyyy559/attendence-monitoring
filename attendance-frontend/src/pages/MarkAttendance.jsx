import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Loader2, UserCheck, Users, Search, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MarkAttendance = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const initialCourseId = queryParams.get('course') || '';

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/dashboard/faculty');
                const fetchedCourses = response.data.courses || [];
                setCourses(fetchedCourses);

                if (initialCourseId) {
                    handleCourseSelect(initialCourseId);
                }
            } catch (error) {
                toast.error("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [initialCourseId]);

    const handleCourseSelect = async (courseId) => {
        if (!courseId) {
            setSelectedCourse('');
            setStudents([]);
            return;
        }
        setSelectedCourse(courseId);
        setFetchingStudents(true);
        try {
            const response = await api.get(`/api/courses/${courseId}/students`);
            setStudents(response.data);

            const initial = {};
            response.data.forEach(s => initial[s.student_id] = 'present');
            setAttendance(initial);
        } catch (error) {
            toast.error("Failed to load students");
            setStudents([]);
        } finally {
            setFetchingStudents(false);
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
        if (!selectedCourse) {
            toast.warn("Please select a course");
            return;
        }
        if (students.length === 0) {
            toast.warn("No students to mark attendance for");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                course_id: selectedCourse,
                class_date: selectedDate,
                attendance_data: Object.keys(attendance).map(id => ({
                    student_id: id,
                    status: attendance[id],
                    remarks: ""
                }))
            };

            await api.post('/api/faculty/attendance/mark', payload);
            toast.success("Attendance saved successfully!");
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to save attendance");
        } finally {
            setSubmitting(false);
        }
    };

    const statusOptions = [
        { value: 'present', label: 'Present', color: '#10b981', light: '#ecfdf5' },
        { value: 'absent', label: 'Absent', color: '#f43f5e', light: '#fff1f2' },
        { value: 'late', label: 'Late', color: '#f59e0b', light: '#fffbeb' },
    ];

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: '#4f46e5' }} />
                <p style={{ color: '#64748b' }}>Initializing session...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="animate-fade-in-up"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/" className="btn-secondary" style={{ padding: '10px', borderRadius: '10px' }}>
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Session Roster</h1>
                        <p className="page-subtitle">Mark and verify student attendance for this session.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleMarkAll('present')} className="btn-secondary" disabled={!selectedCourse}>
                        Reset all to Present
                    </button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={submitting || !selectedCourse} style={{ minWidth: '160px' }}>
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        {submitting ? 'Saving...' : 'Confirm Session'}
                    </button>
                </div>
            </div>

            {/* Selection & Toolbar */}
            <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '24px', alignItems: 'flex-end' }}>
                    <div>
                        <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>
                            Course Session
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className="input-field"
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            <option value="">Select a course roster...</option>
                            {courses.map(c => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_name} ({c.course_code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-semibold" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>
                            Session Date
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="input-field"
                                style={{ backgroundColor: '#f8fafc', paddingLeft: '40px' }}
                            />
                            <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search student by name or roll..."
                            className="input-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '44px' }}
                        />
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                </div>
            </div>

            {/* Student List View */}
            <div className="table-container">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'between', items: 'center', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} style={{ color: '#64748b' }} />
                        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                            Student Roster
                        </h2>
                        <span className="badge-info" style={{ marginLeft: '8px', fontSize: '11px' }}>
                            {filteredStudents.length} Students
                        </span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '350px' }}>Student Identity</th>
                                <th>Status Selection</th>
                                <th style={{ textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {fetchingStudents ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '100px 0' }}>
                                            <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#4f46e5' }} />
                                            <p style={{ color: '#64748b', marginTop: '16px', fontWeight: '500' }}>Synchronizing roster...</p>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="3">
                                            <div className="empty-state">
                                                <div className="empty-state-icon"><Users size={32} /></div>
                                                <p style={{ fontWeight: '600', color: '#0f172a' }}>
                                                    {selectedCourse ? "No students match your search" : "No roster selected"}
                                                </p>
                                                <p style={{ fontSize: '14px', color: '#64748b' }}>
                                                    {selectedCourse ? "Try adjusting your search filters." : "Choose a course session from the dropdown above."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, idx) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={student.student_id}
                                            style={{ transition: 'all 200ms' }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                    <div className="avatar" style={{
                                                        backgroundColor: idx % 3 === 0 ? '#eef2ff' : idx % 3 === 1 ? '#ecfdf5' : '#fffbeb',
                                                        color: idx % 3 === 0 ? '#4f46e5' : idx % 3 === 1 ? '#10b981' : '#f59e0b',
                                                        border: 'none'
                                                    }}>
                                                        {student.full_name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '600', color: '#0f172a', fontSize: '14.5px' }}>{student.full_name}</p>
                                                        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{student.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                                                    {statusOptions.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleStatusChange(student.student_id, opt.value)}
                                                            style={{
                                                                padding: '6px 16px',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                transition: 'all 200ms',
                                                                backgroundColor: attendance[student.student_id] === opt.value ? 'white' : 'transparent',
                                                                color: attendance[student.student_id] === opt.value ? opt.color : '#64748b',
                                                                boxShadow: attendance[student.student_id] === opt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                            }}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={attendance[student.student_id]}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={`pill-badge ${attendance[student.student_id] === 'present' ? 'pill-badge-success' : attendance[student.student_id] === 'absent' ? 'pill-badge-danger' : 'pill-badge-warning'}`}
                                                    >
                                                        {attendance[student.student_id].toUpperCase()}
                                                    </motion.span>
                                                </AnimatePresence>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length > 0 && (
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', alignSelf: 'center' }}>
                            Please review the roster carefully before confirming.
                        </span>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={submitting}
                            style={{ minWidth: '180px', height: '44px' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                            {submitting ? 'Submitting...' : 'Mark as Complete'}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MarkAttendance;
