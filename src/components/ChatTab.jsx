import { useState } from 'react';
import { Send } from 'lucide-react';
import { useChats } from '../hooks/useChats';
import { useAuth } from '../context/AuthContext';

export default function ChatTab() {
  const { userProfile } = useAuth();
  const { chats, loading, sendMessage } = useChats(userProfile?.societyCode);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message, userProfile?.flatNumber);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xl text-slate-900">Chat with Admin</h3>
      <p className="text-sm text-slate-500">Messages are sent anonymously as your flat number for privacy.</p>

      <div className="card h-96 overflow-y-auto space-y-2 p-4">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No messages yet. Start a conversation!</div>
        ) : (
          chats.map(chat => (
            <div key={chat.id} className={`p-3 rounded-xl ${chat.senderFlat === userProfile?.flatNumber ? 'bg-primary-50 ml-12' : 'bg-slate-50 mr-12'}`}>
              <p className="text-sm font-medium text-slate-700">Flat {chat.senderFlat}</p>
              <p className="text-sm text-slate-600 mt-1">{chat.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(chat.timestamp.seconds * 1000).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400"
        />
        <button onClick={handleSend} disabled={!message.trim()} className="btn-primary flex items-center gap-2 px-4">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}