import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold">Urban IFS</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-blue-200 transition-colors duration-200 font-medium">
                Issues
              </Link>
              {user && (
                <Link to="/report" className="text-white hover:text-blue-200 transition-colors duration-200 font-medium">
                  Report Issue
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link to="/admin" className="text-white hover:text-blue-200 transition-colors duration-200 font-medium">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium">Hi, {user.name}</span>
                </div>
                <Link to="/profile" className="text-white hover:text-blue-200 transition-colors duration-200 text-sm font-medium">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-blue-200 transition-colors duration-200 font-medium">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
