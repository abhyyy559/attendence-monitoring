import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle } from 'lucide-react';

const ShortageAlerts = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/api/dashboard/student');
                const shortages = (response.data.courses || []).filter(c => c.shortage);
                setCourses(shortages);
            } catch (error) {
                console.error(error);
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Shortage Alerts</h1>
                <p className="page-subtitle">Courses where your attendance is below 75%</p>
            </div>

            {courses.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-green-600" />
                    </div>
                    <p className="text-gray-900 font-medium">No shortage alerts!</p>
                    <p className="text-sm text-gray-500 mt-1">Your attendance is above 75% in all courses</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course, idx) => (
                        <div key={idx} className="card border-red-200 bg-red-50">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
                                    <p className="text-sm text-gray-600">{course.course_code}</p>
                                    <div className="mt-3 flex items-center space-x-4">
                                        <div className="flex-1">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-bar-fill bg-red-500"
                                                    style={{ width: `${course.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-red-600">{course.percentage}%</span>
                                    </div>
                                    <p className="text-xs text-red-600 mt-2">
                                        You need {Math.ceil((75 - course.percentage) * 1.5)} more classes to reach 75%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShortageAlerts;
