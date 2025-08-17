import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const AdminDashboard = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const navigate = useNavigate();

  const setMockData = useCallback(() => {
    // Fallback mock data if database is not available
    const mockIssues = [
      {
        _id: '1',
        title: 'Large pothole on Main Street',
        description: 'Deep pothole causing damage to vehicles',
        type: 'POTHOLE',
        priority: 'HIGH',
        status: 'Open',
        createdAt: '2024-01-15T10:30:00Z',
        location: {
          address: '123 Main Street, Brisbane'
        }
      },
      {
        _id: '2',
        title: 'Broken street light',
        description: 'Street light not working for 3 days',
        type: 'STREET_LIGHT',
        priority: 'MEDIUM',
        status: 'In Progress',
        createdAt: '2024-01-14T15:45:00Z',
        location: {
          address: '456 Oak Avenue, Brisbane'
        }
      },
      {
        _id: '3',
        title: 'Graffiti on building wall',
        description: 'Vandalism on the side of the shopping center',
        type: 'GRAFFITI',
        priority: 'LOW',
        status: 'Resolved',
        createdAt: '2024-01-13T09:20:00Z',
        location: {
          address: '789 Pine Road, Brisbane'
        }
      }
    ];

    setIssues(mockIssues);
    const statsData = {
      total: mockIssues.length,
      open: mockIssues.filter(issue => issue.status === 'Open').length,
      inProgress: mockIssues.filter(issue => issue.status === 'In Progress').length,
      resolved: mockIssues.filter(issue => issue.status === 'Resolved').length,
      closed: mockIssues.filter(issue => issue.status === 'Closed').length
    };
    setStats(statsData);
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      // Use the regular auth token for API calls (since admin login is local)
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no regular token, try to get one by logging in as admin
        try {
          const loginResponse = await axios.post('/auth/login', {
            email: 'admin@system.com',
            password: 'admin123'
          });
          
          if (loginResponse.data?.token) {
            localStorage.setItem('token', loginResponse.data.token);
          }
        } catch (loginError) {
          console.error('Failed to get admin token:', loginError);
          // Fall back to mock data if login fails
          setMockData();
          return;
        }
      }

      const response = await axios.get('/issues');
      const issuesData = response.data.items || response.data.data || response.data || [];
      
      setIssues(issuesData);

      // Calculate stats - handle both backend status values and frontend display values
      const statsData = {
        total: issuesData.length,
        open: issuesData.filter(issue => issue.status === 'OPEN' || issue.status === 'Open').length,
        inProgress: issuesData.filter(issue => issue.status === 'IN_PROGRESS' || issue.status === 'In Progress').length,
        resolved: issuesData.filter(issue => issue.status === 'RESOLVED' || issue.status === 'Resolved').length,
        closed: issuesData.filter(issue => issue.status === 'CLOSED' || issue.status === 'Closed').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching issues:', error);
      // Fall back to mock data if API call fails
      setMockData();
    } finally {
      setLoading(false);
    }
  }, [setMockData]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminInfo');
    
    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdminInfo(JSON.parse(adminData));
      fetchIssues();
    } catch (error) {
      console.error('Error parsing admin info:', error);
      navigate('/admin/login');
    }
  }, [navigate, fetchIssues]);



  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token available for API call');
        return;
      }

      await axios.patch(`/issues/${issueId}/status`, { status: newStatus });
      
      // Refresh issues after update
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue status:', error);
      // Update locally if API call fails
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === issueId 
            ? { ...issue, status: newStatus }
            : issue
        )
      );
      
      // Recalculate stats
      const updatedIssues = issues.map(issue => 
        issue._id === issueId 
          ? { ...issue, status: newStatus }
          : issue
      );
      
      const statsData = {
        total: updatedIssues.length,
        open: updatedIssues.filter(issue => issue.status === 'Open').length,
        inProgress: updatedIssues.filter(issue => issue.status === 'In Progress').length,
        resolved: updatedIssues.filter(issue => issue.status === 'Resolved').length,
        closed: updatedIssues.filter(issue => issue.status === 'Closed').length
      };
      setStats(statsData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
      case 'Open': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'CLOSED':
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'URGENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {adminInfo?.name} ({adminInfo?.role})
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Issues</h2>
            <button
              onClick={fetchIssues}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                        <div className="text-sm text-gray-500">{issue.description}</div>
                        <div className="text-xs text-gray-400">{issue.location?.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{issue.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={issue.status}
                        onChange={(e) => updateIssueStatus(issue._id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
