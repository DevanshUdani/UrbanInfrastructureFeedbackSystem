import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MapPicker from '../components/MapPicker';
import { createIssue } from '../api/issues';

export default function ReportIssue() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    type: 'POTHOLE',
    description: '',
    priority: 'MEDIUM',
    latitude: -27.4698,
    longitude: 153.0251,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-detect current location on component mount (with user permission)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          update('latitude', latitude);
          update('longitude', longitude);
          setMessage('Current location detected! You can adjust by clicking elsewhere on the map.');
        },
        (error) => {
          // Silently fail - user can still use the map manually
          console.log('Auto-location failed:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage('Please log in to report an issue.');
      return;
    }
    
    setSubmitting(true);
    setMessage('');
    try {
      // Format the data according to the backend Issue model
      const issueData = {
        title: form.title,
        type: form.type,
        description: form.description,
        priority: form.priority,
        location: {
          geo: {
            type: 'Point',
            coordinates: [form.longitude, form.latitude] // [lng, lat] as required by backend
          },
          address: 'Selected location' // You can enhance this with reverse geocoding
        }
      };
      
      await createIssue(issueData, file);
      setMessage('Issue reported successfully! You can track it on the Issues page.');
      setForm({ ...form, title: '', description: '' });
      setFile(null);
    } catch (err) {
      console.error('Issue submission error:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to submit issue.';
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Show message if user is not authenticated
  if (!user) {
  return (
    <div className="max-w-3xl mx-auto p-4">
        <div className="text-center py-8">
      <h1 className="text-2xl font-semibold mb-4">Report an Issue</h1>
          <p className="text-gray-500 mb-4">Please log in to report an issue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Report an Issue</h1>
        
        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              placeholder="Brief description of the issue"
              value={form.title} 
              onChange={e => update('title', e.target.value)} 
              required 
            />
          </div>
          
          {/* Type and Description Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={form.type}
                onChange={e => update('type', e.target.value)}
                required
              >
                <option value="POTHOLE">Pothole</option>
                <option value="STREET_LIGHT">Street Light</option>
                <option value="GRAFFITI">Graffiti</option>
                <option value="TRASH">Trash</option>
                <option value="WATER_LEAK">Water Leak</option>
                <option value="SIDEWALK">Sidewalk</option>
                <option value="SIGNAGE">Signage</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={form.priority || 'MEDIUM'}
                onChange={e => update('priority', e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
        </select>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              rows="4" 
              placeholder="Provide detailed description of the issue..."
              value={form.description} 
              onChange={e => update('description', e.target.value)}
              required
            />
          </div>
          
          {/* Location - Single Map Option */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Location</label>
          <MapPicker
            value={{ lat: form.latitude, lng: form.longitude }}
            onChange={(ll) => {
              update('latitude', ll.lat);
              update('longitude', ll.lng);
            }}
              onLocationFound={(ll) => {
                update('latitude', ll.lat);
                update('longitude', ll.lng);
                setMessage('Current location detected! You can adjust by clicking elsewhere on the map.');
              }}
              onLocationError={(error) => {
                setMessage('Could not get current location. Please select a location manually on the map.');
              }}
          />
        </div>
          
          {/* Photo Upload */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6a1 1 0 0 1 1-1h.667a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-.667a1 1 0 0 1-1-1Z"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
              </label>
            </div>
            {file && (
              <div className="mt-2 text-sm text-green-600">
                ✓ {file.name} selected
              </div>
            )}
        </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors shadow-sm"
            >
              {submitting ? 'Submitting Issue...' : 'Submit Issue'}
        </button>
          </div>
          
          {/* Messages */}
          {message && (
            <div className={`text-sm p-4 rounded-lg border ${
              message.includes('successfully') || message.includes('detected')
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {message}
            </div>
          )}
      </form>
      </div>
    </div>
  );
}
