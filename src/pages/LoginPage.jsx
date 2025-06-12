import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/"; // Redirect back to intended page or home

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true }); // Redirect after successful login
        } catch (err) {
            console.error("Login failed:", err);
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-primary">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-secondary-dark mb-6">Skill Tracker Login</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-error/10 text-error text-sm p-3 rounded mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                            placeholder="you@company.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <LoadingSpinner /> : 'Login'}
                    </button>
                </form>
                <p className="text-center text-secondary text-sm mt-6">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
