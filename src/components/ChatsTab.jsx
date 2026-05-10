import { useChats } from '../hooks/useChats';
import { useAuth } from '../context/AuthContext';

export default function ChatsTab() {
  const { userProfile } = useAuth();
  const { chats, loading } = useChats(userProfile?.societyCode);

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xl text-slate-900">All Chats</h3>
      <p className="text-sm text-slate-500">View messages from residents (shown as flat numbers for privacy).</p>

      <div className="card h-96 overflow-y-auto space-y-2 p-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No messages yet.</div>
        ) : (
          chats.map(chat => (
            <div key={chat.id} className="p-3 rounded-xl bg-slate-50">
              <p className="text-sm font-medium text-slate-700">Flat {chat.senderFlat}</p>
              <p className="text-sm text-slate-600 mt-1">{chat.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(chat.timestamp.seconds * 1000).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}