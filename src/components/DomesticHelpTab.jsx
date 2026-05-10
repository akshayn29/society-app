import { useState } from 'react';
import { Plus, Clock, CheckCircle, X } from 'lucide-react';
import { useDomesticHelp } from '../hooks/useDomesticHelp';
import { useAuth } from '../context/AuthContext';

const HELP_TYPES = ["Maid", "Cook", "Driver", "Sweeper", "Gardener", "Security", "Other"];

export default function DomesticHelpTab() {
  const { userProfile } = useAuth();
  const { todaysHelpers, loading, requestHelp } = useDomesticHelp();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [helpForm, setHelpForm] = useState({
    type: "",
    description: "",
    preferredTime: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!helpForm.type || !helpForm.description) return;
    setSubmitting(true);
    try {
      await requestHelp({
        ...helpForm,
        flatNumber: userProfile?.flatNumber,
        societyCode: userProfile?.societyCode
      });
      setHelpForm({ type: "", description: "", preferredTime: "" });
      setShowForm(false);
      setSuccess("Help request submitted!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-slate-900">Domestic Help</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Request Help"}
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}

      {showForm && (
        <div className="card border-2 border-primary-100">
          <form onSubmit={handleSubmit} className="space-y-3">
            <select required value={helpForm.type} onChange={(e) => setHelpForm({ ...helpForm, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 bg-white">
              <option value="">Select Help Type *</option>
              {HELP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <textarea
              placeholder="Description of work needed *"
              value={helpForm.description}
              onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 h-24 resize-none"
              required
            />
            <input
              type="datetime-local"
              placeholder="Preferred Time"
              value={helpForm.preferredTime}
              onChange={(e) => setHelpForm({ ...helpForm, preferredTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800"
            />
            <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
              {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" />Submit Request</>}
            </button>
          </form>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Today's Helpers</h4>
        {loading ? (
          <div className="card text-center py-8 text-slate-400">Loading...</div>
        ) : todaysHelpers.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-2">🧹</div>
            <p className="text-slate-500">No helpers scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysHelpers.map((helper, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {helper.type?.[0] || "H"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{helper.type}</div>
                    <div className="text-sm text-slate-500">{helper.description}</div>
                    <div className="text-xs text-slate-400">Flat {helper.flatNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{helper.status}</div>
                    {helper.preferredTime && <div className="text-xs text-slate-400">{new Date(helper.preferredTime).toLocaleTimeString()}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}