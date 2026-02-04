import { FileText, Download, Calendar } from 'lucide-react';

const Reports = () => {
    const reports = [
        {
            title: 'Attendance Summary',
            description: 'Overall attendance across all courses',
            icon: FileText,
            color: '#4f46e5',
            bg: '#eef2ff'
        },
        {
            title: 'Course-wise Report',
            description: 'Detailed attendance by individual course',
            icon: Calendar,
            color: '#10b981',
            bg: '#ecfdf5'
        },
        {
            title: 'Shortage Report',
            description: 'Courses where attendance is below 75%',
            icon: FileText,
            color: '#f59e0b',
            bg: '#fffbeb'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Generate and download attendance reports</p>
            </div>

            {/* Reports Card */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Available Reports</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reports.map((report, idx) => {
                        const Icon = report.icon;
                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '20px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        backgroundColor: report.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon size={22} style={{ color: report.color }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', color: '#0f172a' }}>
                                            {report.title}
                                        </p>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
                                            {report.description}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Reports;
