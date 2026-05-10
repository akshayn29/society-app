import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

