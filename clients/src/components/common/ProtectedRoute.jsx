import { useAuth } from '../../context/AuthContent'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {  // accept allowedRoles prop
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className='flex justify-center p-25'>
                <div className="loader"></div>
            </div>
        )
    }

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Logged in but wrong role → redirect based on their actual role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />
        if (user.role === "seller") return <Navigate to="/dashboard" replace />
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

// Redirects logged-in users away from auth pages (login, register, etc.)
const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className='flex justify-center p-25'>
                <div className='loader'></div>
            </div>
        )
    }

    if (user) {
        if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />
        if (user.role === "seller") return <Navigate to="/dashboard" replace />
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export { ProtectedRoute, PublicRoute }