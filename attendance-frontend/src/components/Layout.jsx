import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />

            <div style={{
                flex: 1,
                marginLeft: '260px',
                backgroundColor: '#f8fafc'
            }}>
                {/* Header */}
                <header style={{
                    height: '64px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px'
                }}>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>
                            Welcome back,{' '}
                            <span style={{ color: '#0f172a', fontWeight: '500' }}>
                                {user?.full_name}
                            </span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button style={{
                            position: 'relative',
                            padding: '8px',
                            color: '#64748b',
                            background: 'none',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#f43f5e',
                                borderRadius: '50%',
                                border: '2px solid white'
                            }} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{
                    padding: '32px',
                    maxWidth: '1280px',
                    margin: '0 auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
