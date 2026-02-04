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
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">My Courses</h1>
                <p className="page-subtitle">Courses you are enrolled in</p>
            </div>

            {courses.length === 0 ? (
                <div className="card text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No courses enrolled</p>
                    <p className="text-sm text-gray-400 mt-1">Contact admin to enroll in courses</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, idx) => (
                        <div key={idx} className="card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
                                    <p className="text-sm text-gray-500">{course.course_code}</p>
                                </div>
                                <span className={`${course.shortage ? 'badge-danger' : 'badge-success'}`}>
                                    {course.percentage}%
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="progress-bar">
                                    <div
                                        className={`progress-bar-fill ${course.shortage ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${course.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
