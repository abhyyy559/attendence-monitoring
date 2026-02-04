import { FileText, Download, Calendar, BarChart3, PieChart as PieChartIcon, ArrowRight, Clock, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const reportCategories = [
        {
            group: 'Academic Performance',
            items: [
                {
                    title: 'Attendance Summary',
                    description: 'Comprehensive overview of presence across all enrolled systems.',
                    icon: BarChart3,
                    color: '#4f46e5',
                    bg: '#eef2ff',
                    type: 'PDF / CSV'
                },
                {
                    title: 'Course-wise Analysis',
                    description: 'Detailed session breakdowns and participation metrics per course.',
                    icon: PieChartIcon,
                    color: '#10b981',
                    bg: '#ecfdf5',
                    type: 'PDF'
                }
            ]
        },
        {
            group: 'Compliance & Risks',
            items: [
                {
                    title: 'Shortage Audit',
                    description: 'Identifies all students currently below the 75% critical threshold.',
                    icon: FileText,
                    color: '#f59e0b',
                    bg: '#fffbeb',
                    type: 'Excel'
                }
            ]
        }
    ];

    const recentDownloads = [
        { name: 'Jan_Attendance_Final.pdf', size: '1.2 MB', date: '2 hours ago' },
        { name: 'Shortage_List_CS.csv', size: '420 KB', date: 'Yesterday' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Reporting Center</h1>
                    <p className="page-subtitle">Configure, generate and export unified attendance records.</p>
                </div>
                <button className="btn-primary">
                    <Calendar size={18} />
                    Schedule Export
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Main Reports Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {reportCategories.map((cat, groupIdx) => (
                        <div key={cat.group} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {cat.group}
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                {cat.items.map((report, idx) => {
                                    const Icon = report.icon;
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -2 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '24px',
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                                transition: 'all 200ms'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{
                                                    width: '52px',
                                                    height: '52px',
                                                    borderRadius: '14px',
                                                    backgroundColor: report.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: report.color
                                                }}>
                                                    <Icon size={26} />
                                                </div>
                                                <div style={{ maxWidth: '400px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>
                                                            {report.title}
                                                        </p>
                                                        <span className="badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>{report.type}</span>
                                                    </div>
                                                    <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                                                        {report.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="btn-secondary" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                height: '44px',
                                                padding: '0 20px',
                                                borderRadius: '10px',
                                                backgroundColor: 'white'
                                            }}>
                                                <Download size={18} />
                                                Generate
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Context */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} style={{ color: '#6366f1' }} />
                            <h2 className="card-title">Recent Downloads</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            {recentDownloads.map((dl, i) => (
                                <div key={i} style={{
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #edf2f7',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{dl.name}</p>
                                        <FileSpreadsheet size={14} style={{ color: '#94a3b8' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{dl.size}</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{dl.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="text-link" style={{ fontSize: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View full download history <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="card" style={{
                        background: 'linear-gradient(180deg, #f8fafc 0%, white 100%)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Custom Parameters</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Need a specific dataset? Use our advanced query builder.</p>
                        <button className="btn-secondary" style={{ width: '100%', fontSize: '12px' }}>Open Query Builder</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
