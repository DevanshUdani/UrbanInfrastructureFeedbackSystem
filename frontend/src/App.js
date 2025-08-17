import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/signup';
import IssueList from './pages/IssueList';
import ReportIssue from './pages/ReportIssue';
import IssueDetail from './pages/IssueDetail';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const Protected = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role permissions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AdminProtected = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const adminInfo = localStorage.getItem('adminInfo');
  
  if (!adminToken || !adminInfo) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtected>
                  <AdminDashboard />
                </AdminProtected>
              } 
            />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <>
                <Navbar />
                <Protected>
                  <IssueList />
                </Protected>
              </>
            } />
            
            <Route path="/report" element={
              <>
                <Navbar />
                <Protected>
                  <ReportIssue />
                </Protected>
              </>
            } />
            
            <Route path="/issues/:id" element={
              <>
                <Navbar />
                <Protected>
                  <IssueDetail />
                </Protected>
              </>
            } />
            
            <Route path="/profile" element={
              <>
                <Navbar />
                <Protected>
                  <Profile />
                </Protected>
              </>
            } />
            
            {/* Redirect to home if no route matches */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
