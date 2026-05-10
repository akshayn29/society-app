import { CheckCircle, Clock } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import { useAuth } from '../context/AuthContext';

export default function ComplaintsTab() {
  const { userProfile } = useAuth();
  const { complaints, loading, updateStatus } = useComplaints(userProfile?.societyCode);

  const handleStatusChange = async (id, status) => {
    await updateStatus(id, status);
  };

  const statusIcon = (status) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xl text-slate-900">Complaints</h3>

      {loading ? (
        <div className="card text-center py-8 text-slate-400">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-slate-500">No complaints yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(complaint => (
            <div key={complaint.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{complaint.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{complaint.description}</p>
                  <p className="text-xs text-slate-500 mt-2">Raised by Flat {complaint.raisedByFlat} · {new Date(complaint.timestamp.seconds * 1000).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(complaint.status)}
                  <select
                    value={complaint.status}
                    onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                    className="text-sm border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}