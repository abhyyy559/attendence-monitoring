import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, CheckCircle, XCircle } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getStudentData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching student dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const worstCourse = data?.courses?.length > 0
        ? data.courses.reduce((prev, curr) => (prev.percentage < curr.percentage) ? prev : curr)
        : null;

    const totalCourses = data?.courses?.length || 0;
    const presentCount = data?.courses?.filter(c => !c.shortage).length || 0;
    const shortageCount = data?.courses?.filter(c => c.shortage).length || 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back, {user?.full_name}</p>
            </div>

            {/* Overall Attendance Card */}
            <div className="card text-center">
                <p className="text-sm text-gray-500 mb-2">Overall Attendance</p>
                <p className="text-5xl font-semibold text-gray-900">{data?.overall_percentage || 0}%</p>
                <p className="text-sm text-gray-500 mt-2">
                    {data?.overall_percentage >= 75 ? (
                        <span className="text-green-600">You are meeting the attendance requirement</span>
                    ) : (
                        <span className="text-red-600">You are below the 75% requirement</span>
                    )}
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                            <BookOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Courses</p>
                            <p className="text-xl font-semibold text-gray-900">{totalCourses}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-md">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">On Track</p>
                            <p className="text-xl font-semibold text-gray-900">{presentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-md">
                            <XCircle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Shortage</p>
                            <p className="text-xl font-semibold text-gray-900">{shortageCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Course-wise Attendance</h2>
                </div>
                <div className="space-y-4">
                    {data?.courses?.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {course.course_name}
                                </p>
                                <p className="text-xs text-gray-500">{course.course_code}</p>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <div className="w-32">
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-bar-fill ${course.shortage ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${course.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className={`text-sm font-medium w-12 text-right ${course.shortage ? 'text-red-600' : 'text-green-600'}`}>
                                    {course.percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                    {(!data?.courses || data.courses.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">No courses enrolled</p>
                    )}
                </div>
            </div>

            {/* Shortage Alerts */}
            {shortageCount > 0 && (
                <div className="card border-amber-200 bg-amber-50">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-amber-800">Shortage Alert</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                You have shortage in {shortageCount} course(s). Minimum 75% attendance is required.
                            </p>
                            <Link to="/student/shortage" className="text-sm text-amber-800 font-medium underline mt-2 inline-block">
                                View details →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
