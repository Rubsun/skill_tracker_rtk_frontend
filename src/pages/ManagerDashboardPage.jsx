import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { AuthContext } from '../contexts/AuthContext';

const API_URL = 'http://localhost:8000/api/v1';

const EditIcon = () => <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>;
const AssignIcon = () => <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
const ChartBarIcon = () => <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a1 1 0 001 1h1.172l1.513 1.513a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-1.586-1.586a1 1 0 00-1.414 0L10 10.586 8.707 9.293a1 1 0 00-1.414 0L3 13.586V5a1 1 0 00-.293-.707L2 3.586A1 1 0 001 4v9a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1-1zm14-1a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V3a1 1 0 00-1-1h-1z" clipRule="evenodd"></path></svg>;

const ManagerDashboardPage = () => {
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) { setLoading(false); return; }
            setLoading(true);
            try {
                // Fetch courses created by the manager
                const coursesPromise = fetch(`${API_URL}/courses/my`, {
                    headers: { 'Authorization': `Bearer ${user.token}` },
                });
                // Fetch all users for the assignment dropdown
                const usersPromise = fetch(`${API_URL}/users/all`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });

                const [coursesResponse, usersResponse] = await Promise.all([coursesPromise, usersPromise]);
                
                if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
                if (!usersResponse.ok) throw new Error('Failed to fetch users');
                
                const coursesData = await coursesResponse.json();
                const usersData = await usersResponse.json();

                setCourses(coursesData);
                setUsers(usersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);
    
    const openAssignModal = (courseId) => {
        setSelectedCourseId(courseId);
        setAssignModalOpen(true);
    };

    const handleAssignCourse = async () => {
        if (!selectedCourseId || !selectedUserId) {
            alert("Please select a user.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/courses/${selectedCourseId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ user_id: selectedUserId }),
            });
            if (!response.ok) throw new Error("Assignment failed");
            alert("Course assigned successfully!");
            setAssignModalOpen(false);
            setSelectedCourseId(null);
            setSelectedUserId('');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                <Link to="/manager/course/new" className="btn btn-primary">Create New Course</Link>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
            <div className="bg-surface rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Course Name</th>
                            <th className="px-6 py-3 text-left">Lessons</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="px-6 py-4">{course.title}</td>
                                <td className="px-6 py-4">{course.lessons.length}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => alert('Edit not implemented yet')} className="btn btn-sm btn-ghost"><EditIcon /> Edit</button>
                                    <button onClick={() => openAssignModal(course.id)} className="btn btn-sm btn-secondary"><AssignIcon /> Assign</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Assign Course</h3>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full input mb-4"
                        >
                            <option value="" disabled>Select a user</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                        </select>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setAssignModalOpen(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleAssignCourse} className="btn btn-primary">Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboardPage;