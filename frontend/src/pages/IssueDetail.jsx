import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addComment, getIssue, updateIssueStatus } from '../api/issues';
import { useAuth } from '../context/AuthContext';

export default function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIssue(id);
        setIssue(data);
      } catch (err) {
        console.error('Error loading issue:', err);
        setError('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      await addComment(id, comment);
      setComment('');
      const data = await getIssue(id);
      setIssue(data);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const changeStatus = async () => {
    await updateIssueStatus(id, newStatus, `Updated by ${user?.name || 'admin'}`);
    const data = await getIssue(id);
    setIssue(data);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center py-8">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex gap-4">
        {issue.photoUrl && (
          <img src={issue.photoUrl} alt="issue" className="w-40 h-40 object-cover rounded-xl" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{issue.title}</h1>
          <div className="text-sm text-gray-500">{issue.type} • {issue.status}</div>
          <p className="mt-2">{issue.description}</p>
          <div className="text-sm mt-2">Lat: {issue.latitude} | Lng: {issue.longitude}</div>
        </div>
      </div>

      <h2 className="mt-6 font-semibold">Status History</h2>
      <ul className="list-disc ml-5">
        {issue.statusHistory?.map((s, idx) => (
          <li key={idx}>{s.status} — {new Date(s.at).toLocaleString()} — {s.note}</li>
        ))}
      </ul>

      <h2 className="mt-6 font-semibold">Comments</h2>
      <ul className="space-y-2 mb-3">
        {issue.comments?.map((c, idx) => (
          <li key={idx} className="border rounded p-2">
            <div className="text-sm">{c.text}</div>
            <div className="text-xs text-gray-500">{c.authorName} — {new Date(c.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>

      {user && (
        <form onSubmit={submitComment} className="flex gap-2">
          <input 
            className="flex-1 border rounded p-2" 
            placeholder="Add a comment"
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            disabled={submittingComment}
          />
          <button 
            type="submit"
            disabled={submittingComment || !comment.trim()}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingComment ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}

      {(user?.role === 'Admin' || user?.role === 'Technician') && (
        <div className="mt-6 flex items-center gap-2">
          <select className="border rounded p-2" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button onClick={changeStatus} className="px-3 py-2 rounded bg-black text-white">Update Status</button>
        </div>
      )}
    </div>
  );
}
