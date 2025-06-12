import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { AuthContext } from '../contexts/AuthContext';

const API_URL = 'http://localhost:8000/api/v1';

const EmployeeDashboardPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchAssignedCourses = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/courses/assigned`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch assigned courses.');
                }
                
                const data = await response.json();
                setCourses(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedCourses();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary-dark mb-6">My Assigned Courses</h1>
            {courses.length === 0 ? (
                <p className="text-secondary">You have no courses assigned yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-surface rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <h2 className="text-xl font-semibold text-secondary-dark mb-2">{course.title}</h2>
                                <p className="text-sm text-secondary mb-4">{course.description}</p>
                                <p className="text-sm font-medium text-gray-600">
                                    {course.lessons.length} {course.lessons.length === 1 ? 'lesson' : 'lessons'}
                                </p>
                            </div>
                            <Link
                                to={`/employee/course/${course.id}`}
                                className="mt-4 btn btn-primary w-full"
                            >
                                Start Course
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboardPage;