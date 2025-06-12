import React, { useState, useMemo, useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// --- Page Components ---
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage')); 
const EmployeeDashboardPage = React.lazy(() => import('./pages/EmployeeDashboardPage'));
const ManagerDashboardPage = React.lazy(() => import('./pages/ManagerDashboardPage'));
const CourseEditorPage = React.lazy(() => import('./pages/CourseEditorPage')); 
const CourseAssignmentPage = React.lazy(() => import('./pages/CourseAssignmentPage'));
const CourseViewerPage = React.lazy(() => import('./pages/CourseViewerPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const HomePage = React.lazy(() => import('./pages/HomePage')); 
const ManagerHomePage = React.lazy(() => import('./pages/ManagerHomePage'));
const ManagerCourseStatsPage = React.lazy(() => import('./pages/ManagerCourseStatsPage'));

// --- Common Components ---
import LoadingSpinner from './components/Common/LoadingSpinner'; 

// --- Layout Component ---
import MainLayout from './components/Common/Layouts/MainLayout';

const API_URL = 'http://localhost:8000/api/v1'; // Or your backend URL

const useAuth = () => {
    const getInitialUser = () => {
        try {
            const storedUser = localStorage.getItem('skillTrackerUser');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('skillTrackerUser');
        }
        return null;
    };

    const [user, setUser] = useState(getInitialUser());

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/jwt/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username: email, password: password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        const token = data.access_token;

        // Fetch user details with the new token
        const userResponse = await fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        
        const userToStore = {
            token,
            email: userData.email,
            role: userData.role || 'employee', // Assuming role is returned, default to employee
            name: userData.name || email.split('@')[0]
        };
        
        localStorage.setItem('skillTrackerUser', JSON.stringify(userToStore));
        setUser(userToStore);
        return userToStore;
    };

    const register = async (email, name, password, role) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        
        // After register, log in to get a token
        return await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('skillTrackerUser');
        setUser(null);
    };

    const authContextValue = useMemo(() => ({ user, login, register, logout }), [user]);

    return authContextValue;
};

// --- Protected Route Component ---
function ProtectedRoute({ allowedRoles }) {
    const { user } = React.useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />; 
}

function App() {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            <React.Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} /> 

                    {/* Routes requiring authentication */}
                    <Route element={<ProtectedRoute allowedRoles={['employee', 'manager']} />}>
                        <Route element={<MainLayout />}> 
                            <Route path="/" element={<HomePage />} />

                            {/* Employee Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                                <Route path="employee/dashboard" element={<EmployeeDashboardPage />} />
                                <Route path="employee/course/:courseId" element={<CourseViewerPage />} />
                            </Route>

                            {/* Manager Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                                <Route path="manager/home" element={<ManagerHomePage />} />
                                <Route path="manager/dashboard" element={<ManagerDashboardPage />} />
                                <Route path="manager/course/new" element={<CourseEditorPage key="new" mode="create" />} /> 
                                <Route path="manager/course/edit/:courseId" element={<CourseEditorPage key="edit" mode="edit" />} /> 
                                <Route path="manager/course/assign/:courseId" element={<CourseAssignmentPage />} />
                                <Route path="manager/course/:courseId" element={<CourseViewerPage />} /> 
                                <Route path="manager/course/stats/:courseId" element={<ManagerCourseStatsPage />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Catch-all Not Found Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </React.Suspense>
        </AuthContext.Provider>
    );
}

export default App;