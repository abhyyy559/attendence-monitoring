import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Sidebar />

            <div style={{
                flex: 1,
                marginLeft: '260px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Global Top Navbar */}
                <header style={{
                    height: '70px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #edf2f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Universal search (Alt + K)..."
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 40px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '13px',
                                backgroundColor: '#f1f5f9'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button className="btn-secondary" style={{ border: 'none', padding: '8px' }}>
                            <HelpCircle size={20} color="#64748b" />
                        </button>

                        <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }} />

                        <button style={{
                            position: 'relative',
                            padding: '10px',
                            color: '#64748b',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 200ms'
                        }}>
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '18px',
                                height: '18px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '10px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white'
                            }}>
                                3
                            </span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{user?.full_name}</p>
                                <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>{user?.role}</p>
                            </div>
                            <div className="avatar" style={{ border: 'none', backgroundColor: '#eef2ff' }}>
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <main style={{
                    padding: '40px',
                    maxWidth: '1400px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
