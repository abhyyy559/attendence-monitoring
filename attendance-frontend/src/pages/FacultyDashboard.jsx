import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckSquare } from 'lucide-react';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getFacultyData();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching faculty dashboard data", error);
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

    const totalStudents = data?.courses?.reduce((acc, c) => acc + c.student_count, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Faculty Dashboard</h1>
                    <p className="page-subtitle">{data?.faculty_info?.department} • ID: {data?.faculty_info?.employee_id}</p>
                </div>
                <Link to="/mark-attendance" className="btn-primary">
                    Mark Attendance
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                            <BookOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Assigned Courses</p>
                            <p className="text-xl font-semibold text-gray-900">{data?.courses?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-md">
                            <Users size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-xl font-semibold text-gray-900">{totalStudents}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-amber-100 rounded-md">
                            <CheckSquare size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="text-xl font-semibold text-gray-900">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Table */}
            <div className="table-container">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Students</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.courses?.map((course) => (
                            <tr key={course.course_id}>
                                <td className="font-medium">{course.course_code}</td>
                                <td>{course.course_name}</td>
                                <td>{course.student_count}</td>
                                <td>
                                    <Link
                                        to="/mark-attendance"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Mark Attendance
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!data?.courses || data.courses.length === 0) && (
                            <tr>
                                <td colSpan="4" className="text-center text-gray-500 py-8">
                                    No courses assigned
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyDashboard;
