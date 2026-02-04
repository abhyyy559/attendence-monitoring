import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, Hash } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="page-title">Profile</h1>
                <p className="page-subtitle">Your account information</p>
            </div>

            <div className="card">
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-100 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-semibold text-blue-600">
                            {user?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{user?.full_name}</h2>
                        <span className="badge-info capitalize">{user?.role}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Mail size={20} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-gray-900">{user?.email}</p>
                        </div>
                    </div>

                    {user?.phone && (
                        <div className="flex items-center space-x-3">
                            <Phone size={20} className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-gray-900">{user?.phone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                        Change Password
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                        Update Profile Information
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                        Notification Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
