import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection, query, where, onSnapshot,
  addDoc, orderBy, serverTimestamp,
} from "firebase/firestore";
import { MessageCircle, Send, ArrowLeft, Search } from "lucide-react";

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export default function SocietyMembersTab() {
  const { userProfile } = useAuth();
  const [members, setMembers]                   = useState([]);
  const [loadingMembers, setLoadingMembers]     = useState(true);
  const [search, setSearch]                     = useState("");
  const [selectedMember, setSelectedMember]     = useState(null);
  const [messages, setMessages]                 = useState([]);
  const [loadingMessages, setLoadingMessages]   = useState(false);
  const [text, setText]                         = useState("");
  const [sending, setSending]                   = useState(false);
  const bottomRef = useRef(null);

  // ── Fetch all society members ──
  useEffect(() => {
    if (!userProfile?.societyCode) return;
    const q = query(
      collection(db, "users"),
      where("societyCode", "==", userProfile.societyCode)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((m) => m.id !== userProfile.uid);
      data.sort((a, b) =>
        (a.flatNumber || "").localeCompare(b.flatNumber || "", undefined, { numeric: true })
      );
      setMembers(data);
      setLoadingMembers(false);
    });
    return unsub;
  }, [userProfile]);

  // ── Fetch messages for selected member ──
  useEffect(() => {
    if (!selectedMember || !userProfile?.uid) return;
    setLoadingMessages(true);
    const chatId = getChatId(userProfile.uid, selectedMember.id);
    const q = query(
      collection(db, "directChats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingMessages(false);
    });
    return unsub;
  }, [selectedMember, userProfile]);

  // ── Auto scroll ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedMember) return;
    setSending(true);
    const chatId = getChatId(userProfile.uid, selectedMember.id);
    try {
      await addDoc(collection(db, "directChats", chatId, "messages"), {
        text:       text.trim(),
        senderFlat: userProfile.flatNumber,
        senderName: userProfile.name || "",
        senderUid:  userProfile.uid,
        createdAt:  serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  const roleBadge = (role) => {
    if (role === "tenant") return "bg-purple-100 text-purple-700";
    if (role === "admin")  return "bg-blue-100 text-blue-700";
    if (role === "guard")  return "bg-slate-100 text-slate-600";
    return "bg-green-100 text-green-700";
  };

  // ── Filter members by search ──
  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.flatNumber || "").toLowerCase().includes(q) ||
      (m.role || "").toLowerCase().includes(q)
    );
  });

  // ══════════════════════════════════════
  // CHAT VIEW
  // ══════════════════════════════════════
  if (selectedMember) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedMember(null); setMessages([]); }}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl text-slate-900">
              Flat {selectedMember.flatNumber}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadge(selectedMember.role)}`}>
              {selectedMember.role || "owner"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="card h-[26rem] overflow-y-auto flex flex-col gap-2 p-4">
          {loadingMessages ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const mine = msg.senderUid === userProfile.uid;
              return (
                <div key={msg.id}
                  className={`flex flex-col max-w-[80%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
                  <span className="text-xs text-slate-400 mb-0.5 px-1">
                    {mine ? "You" : `Flat ${msg.senderFlat}`}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm
                    ${mine
                      ? "bg-primary-500 text-white rounded-tr-sm"
                      : "bg-slate-100 text-slate-800 rounded-tl-sm"}`}>
                    {msg.text}
                  </div>
                  {msg.createdAt && (
                    <span className="text-xs text-slate-300 mt-0.5 px-1">
                      {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {
                        hour: "2-digit", minute: "2-digit",
                      })}
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
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message Flat ${selectedMember.flatNumber}...`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // ══════════════════════════════════════
  // MEMBERS LIST
  // ══════════════════════════════════════
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-bold text-xl text-slate-900">Society Members</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          {userProfile?.societyCode} · Tap 💬 to message a flat
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by flat number or role..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-800 placeholder-slate-400 text-sm"
        />
      </div>

      {loadingMembers ? (
        <div className="card text-center py-8 text-slate-400">Loading members...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-slate-500">{search ? "No results found." : "No other members found."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <div key={m.id} className="card flex items-center gap-4">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {m.flatNumber || "?"}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Flat {m.flatNumber}</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadge(m.role)}`}>
                  {m.role || "owner"}
                </span>
              </div>

              {/* Message button */}
              <button
                onClick={() => setSelectedMember(m)}
                className="p-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 transition-all"
                title={`Message Flat ${m.flatNumber}`}>
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}