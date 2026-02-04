import { FileText, Download } from 'lucide-react';

const Reports = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Generate and download attendance reports</p>
            </div>

            <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Available Reports</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Attendance Summary</p>
                                <p className="text-sm text-gray-500">Overall attendance across all courses</p>
                            </div>
                        </div>
                        <button className="btn-secondary flex items-center space-x-2">
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Course-wise Report</p>
                                <p className="text-sm text-gray-500">Detailed attendance by course</p>
                            </div>
                        </div>
                        <button className="btn-secondary flex items-center space-x-2">
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <FileText size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Shortage Report</p>
                                <p className="text-sm text-gray-500">Courses below 75% attendance</p>
                            </div>
                        </div>
                        <button className="btn-secondary flex items-center space-x-2">
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
