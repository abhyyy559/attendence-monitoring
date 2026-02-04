import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'student', // default
        phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: formData.role,
                phone: formData.phone
            });
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
                <h3 className="text-2xl font-bold text-center mb-4">Register</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Full Name</label>
                            <input type="text" name="full_name" placeholder="Full Name"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                value={formData.full_name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-gray-700">Email</label>
                            <input type="email" name="email" placeholder="Email"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                value={formData.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-gray-700">Phone</label>
                            <input type="text" name="phone" placeholder="Phone"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                value={formData.phone} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700">Role</label>
                            <select name="role" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" value={formData.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">Password</label>
                            <input type="password" name="password" placeholder="Password"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                value={formData.password} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="block text-gray-700">Confirm Password</label>
                            <input type="password" name="confirmPassword" placeholder="Confirm Password"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex items-baseline justify-between mt-6">
                            <button className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition duration-200">Register</button>
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
