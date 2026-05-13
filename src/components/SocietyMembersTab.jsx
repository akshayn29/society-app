import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChats } from "../hooks/useChats";
import { Send } from "lucide-react";

export default function SocietyMembersTab() {
  const { userProfile } = useAuth();
  const { chats, loading, sendMessage } = useChats(userProfile?.societyCode);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await sendMessage({
        message: message.trim(),
        senderFlat: userProfile?.flatNumber || "?",
        senderName: userProfile?.name || "Resident",
        societyCode: userProfile?.societyCode,
      });
      setMessage("");
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const isMe = (chat) => chat.senderFlat === userProfile?.flatNumber;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-bold text-xl text-slate-900">Society Chat</h3>
        <p className="text-sm text-slate-500 mt-0.5">Chat with all residents of {userProfile?.societyCode}</p>
      </div>

      {/* Chat Window */}
      <div className="card h-[26rem] overflow-y-auto flex flex-col gap-2 p-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading messages...</div>
        ) : chats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          chats.map((chat) => {
            const mine = isMe(chat);
            return (
              <div key={chat.id} className={`flex flex-col max-w-[80%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
                <span className="text-xs text-slate-400 mb-0.5 px-1">
                  {mine ? "You" : `Flat ${chat.senderFlat}${chat.senderName ? ` · ${chat.senderName}` : ""}`}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${mine ? "bg-primary-500 text-white rounded-tr-sm" : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
                  {chat.message}
                </div>
                {chat.timestamp && (
                  <span className="text-xs text-slate-300 mt-0.5 px-1">
                    {new Date(chat.timestamp.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
