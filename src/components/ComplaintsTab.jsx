/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Plus, X, AlertCircle, CheckCircle, Clock, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useComplaints } from "../hooks/useComplaints";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { collection, addDoc, onSnapshot, query, serverTimestamp, getDocs, where } from "firebase/firestore";
import { notifyStatusChange, notifyNewComment } from "../hooks/useNotifications";

const CATEGORIES = ["Maintenance", "Noise", "Parking", "Water/Electricity", "Security", "Cleanliness", "Other"];
const STATUS_STYLES = { pending: "bg-amber-100 text-amber-700", inprogress: "bg-blue-100 text-blue-700", resolved: "bg-green-100 text-green-700" };
const STATUS_LABEL = { pending: "Pending", inprogress: "In Progress", resolved: "Resolved" };

async function getRaiserUid(societyCode, flatNumber) {
  try {
    const q = query(collection(db, "users"), where("societyCode", "==", societyCode), where("flatNumber", "==", flatNumber));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data().uid;
  } catch (e) { console.error(e); }
  return null;
}

function ComplaintComments({ complaint, userProfile }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "complaints", complaint.id, "comments")), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setComments(data);
    });
    return unsub;
  }, [complaint.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "complaints", complaint.id, "comments"), {
        text: text.trim(), authorName: userProfile?.name, authorRole: userProfile?.role,
        authorFlat: userProfile?.flatNumber || null, createdAt: serverTimestamp(),
      });
      if (userProfile?.flatNumber !== complaint.raisedByFlat) {
        const raiserUid = await getRaiserUid(userProfile?.societyCode, complaint.raisedByFlat);
        if (raiserUid && raiserUid !== userProfile?.uid) {
          await notifyNewComment(raiserUid, userProfile?.name || "Someone", complaint.title);
        }
      }
      setText("");
    } catch (err) { console.error(err); }
    setSending(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map(c => {
            const isAdminComment = c.authorRole === "admin";
            return (
              <div key={c.id} className={`flex gap-2 ${isAdminComment ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isAdminComment ? "bg-purple-500" : "bg-blue-400"}`}>
                  {c.authorName?.[0] || "?"}
                </div>
                <div className={`max-w-[80%] flex flex-col ${isAdminComment ? "items-end" : "items-start"}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isAdminComment ? "bg-purple-50 text-purple-900 rounded-tr-sm" : "bg-gray-100 text-slate-800 rounded-tl-sm"}`}>
                    <p className={`text-xs font-semibold mb-0.5 ${isAdminComment ? "text-purple-600" : "text-blue-600"}`}>
                      {isAdminComment ? "Admin" : `${c.authorName}${c.authorFlat ? " · Flat " + c.authorFlat : ""}`}
                    </p>
                    <p>{c.text}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 px-1">
                    {c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "just now"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <form onSubmit={handleSend} className="flex gap-2">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment or reply..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button type="submit" disabled={!text.trim() || sending}
          className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function ComplaintCard({ complaint, userProfile, isAdmin, expandedId, setExpandedId, handleStatusChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {complaint.status === "resolved" ? <CheckCircle className="w-4 h-4 text-green-500" /> :
           complaint.status === "inprogress" ? <AlertCircle className="w-4 h-4 text-blue-500" /> :
           <Clock className="w-4 h-4 text-amber-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{complaint.category}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[complaint.status] || STATUS_STYLES.pending}`}>
              {STATUS_LABEL[complaint.status] || "Pending"}
            </span>
            {complaint.raisedByFlat === userProfile?.flatNumber && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">Mine</span>
            )}
          </div>
          <h4 className="font-semibold text-slate-900">{complaint.title}</h4>
          {complaint.description && <p className="text-sm text-slate-600 mt-1">{complaint.description}</p>}
          <p className="text-xs text-slate-400 mt-1">Flat {complaint.raisedByFlat} · {complaint.raisedByName}
            {complaint.timestamp?.seconds && " · " + new Date(complaint.timestamp.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        {isAdmin && (
          <select value={complaint.status} onChange={(e) => handleStatusChange(complaint, e.target.value)}
            className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-shrink-0 font-medium
              ${complaint.status === "resolved" ? "border-green-200 bg-green-50 text-green-700" :
                complaint.status === "inprogress" ? "border-blue-200 bg-blue-50 text-blue-700" :
                "border-amber-200 bg-amber-50 text-amber-700"}`}>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        )}
      </div>
      <button onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
        className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
        <MessageSquare className="w-3.5 h-3.5" />
        {expandedId === complaint.id ? "Hide comments" : "View / Add comments"}
        {expandedId === complaint.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expandedId === complaint.id && <ComplaintComments complaint={complaint} userProfile={userProfile} />}
    </div>
  );
}

export default function ComplaintsTab() {
  const { userProfile } = useAuth();
  const { complaints, loading, raiseComplaint, updateStatus } = useComplaints(userProfile?.societyCode);
  const isAdmin  = userProfile?.role === "admin";
  const canRaise = userProfile?.role === "owner" || userProfile?.role === "tenant";

  const [activeTab, setActiveTab]     = useState("active");   // "active" | "resolved"
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState("");
  const [expandedId, setExpandedId]   = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  const activeComplaints   = complaints.filter(c => c.status !== "resolved");
  const resolvedComplaints = complaints.filter(c => c.status === "resolved");
  const displayed = activeTab === "active" ? activeComplaints : resolvedComplaints;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) return;
    setSubmitting(true);
    try {
      await raiseComplaint({ title: form.title, description: form.description, category: form.category,
        flatNumber: userProfile?.flatNumber, ownerName: userProfile?.name, societyCode: userProfile?.societyCode });
      setForm({ title: "", description: "", category: "" });
      setShowForm(false);
      setSuccess("Complaint raised successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const handleStatusChange = async (complaint, newStatus) => {
    await updateStatus(complaint.id, newStatus);
    const raiserUid = await getRaiserUid(userProfile?.societyCode, complaint.raisedByFlat);
    if (raiserUid) await notifyStatusChange(raiserUid, complaint.title, newStatus);
  };

  const cardProps = { userProfile, isAdmin, expandedId, setExpandedId, handleStatusChange };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900">{isAdmin ? "All Complaints" : "Complaints"}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? `${complaints.length} total · ${activeComplaints.filter(c => c.status === "pending").length} pending`
              : "View and raise society complaints"}
          </p>
        </div>
        {canRaise && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 text-sm font-medium transition-colors">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? "Cancel" : "Raise Complaint"}
          </button>
        )}
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">✓ {success}</div>}

      {/* Raise form */}
      {showForm && canRaise && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-slate-800">New Complaint</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white">
              <option value="">Select category *</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="text" required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
            <button type="submit" disabled={submitting} className="w-full bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors">
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>
      )}

      {/* Active / Resolved tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-1 gap-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
            ${activeTab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Clock className="w-4 h-4" />
          Active
          {activeComplaints.length > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "active" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"}`}>
              {activeComplaints.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
            ${activeTab === "resolved" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <CheckCircle className="w-4 h-4" />
          Resolved
          {resolvedComplaints.length > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "resolved" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
              {resolvedComplaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Complaints list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">{activeTab === "active" ? "🎉" : "📋"}</div>
          <p className="text-slate-500 font-medium">
            {activeTab === "active" ? "No active complaints!" : "No resolved complaints yet."}
          </p>
          {activeTab === "active" && canRaise && (
            <p className="text-slate-400 text-sm mt-1">Tap "Raise Complaint" to report an issue</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} {...cardProps} />
          ))}
        </div>
      )}
    </div>
  );
}