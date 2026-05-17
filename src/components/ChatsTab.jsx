import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, Search } from 'lucide-react';
import { db } from '../firebase/config';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import useMembers from '../hooks/useMembers';

export default function ChatsTab() {
  const { userProfile } = useAuth();
  const { members, loading: membersLoading } = useMembers();

  const [conversations, setConversations] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [activePanel, setActivePanel] = useState('members');
  const messagesEndRef = useRef(null);

  const societyName = userProfile?.societyName || '';

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allMessages.filter(m =>
        m.chatType === 'admin' &&
        (!societyName || m.societyName === societyName || m.societyCode === societyName)
      );
      const map = {};
      filtered.forEach(msg => {
        const key = msg.senderFlat || msg.flatNumber || 'unknown';
        if (!map[key]) map[key] = [];
        map[key].push(msg);
      });
      const convs = Object.entries(map).map(([flat, msgs]) => ({
        flatNumber: flat,
        lastMessage: msgs[0]?.message || '',
        timestamp: msgs[0]?.timestamp,
        unread: msgs.filter(m => !m.readByAdmin).length,
        allMessages: [...msgs].sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)),
      }));
      setConversations(convs);
      setChatsLoading(false);
    }, (err) => { console.error('Chats error:', err); setChatsLoading(false); });
    return unsub;
  }, [societyName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  useEffect(() => {
    if (!selectedFlat) return;
    const conv = conversations.find(c => c.flatNumber.toString() === selectedFlat.toString());
    if (conv) setSelectedMessages(conv.allMessages);
  }, [conversations, selectedFlat]);

  const flatLabel = (m) => [m.wing, m.flatNumber].filter(Boolean).join('-') || m.flatNumber || 'Ã¢â‚¬â€';

  const handleSelectMember = (member) => {
    const flat = flatLabel(member);
    const conv = conversations.find(c => c.flatNumber.toString() === flat.toString());
    setSelectedMember(member);
    setSelectedFlat(flat);
    setSelectedMessages(conv?.allMessages || []);
    setActivePanel('chats');
  };

  const handleSelectConv = (conv) => {
    setSelectedFlat(conv.flatNumber);
    setSelectedMessages(conv.allMessages);
    const matched = members.find(m => flatLabel(m).toString() === conv.flatNumber.toString());
    setSelectedMember(matched || null);
    setActivePanel('chats');
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedFlat) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats'), {
        message: replyText.trim(),
        chatType: 'admin',
        senderFlat: selectedFlat,
        flatNumber: selectedFlat,
        senderRole: 'admin',
        senderName: userProfile?.name || 'Admin',
        societyName,
        societyCode: userProfile?.societyCode || '',
        timestamp: serverTimestamp(),
        fromAdmin: true,
      });
      setReplyText('');
    } catch (err) { console.error('Send failed:', err); }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || m.flatNumber?.toLowerCase().includes(q) ||
      m.wing?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q);
  });

  const ROLE_COLORS = {
    admin: 'bg-blue-100 text-blue-700', owner: 'bg-green-100 text-green-700',
    tenant: 'bg-purple-100 text-purple-700', guard: 'bg-amber-100 text-amber-700',
  };
  const AVATAR_COLORS = {
    admin: 'from-blue-400 to-blue-600', owner: 'from-green-400 to-green-600',
    tenant: 'from-purple-400 to-purple-600', guard: 'from-amber-400 to-amber-600',
  };

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const formatTime = (ts) => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const formatDate = (ts) => ts?.seconds ? new Date(ts.seconds * 1000).toLocaleDateString() : '';
  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div className="space-y-4">

      {/* Mobile tab switcher Ã¢â‚¬â€ divs only, no buttons */}
      <div className="flex lg:hidden rounded-xl border border-slate-200 overflow-hidden bg-white">
        {[
          { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
          { id: 'chats',   label: 'Conversations', icon: <MessageCircle className="w-4 h-4" /> },
        ].map(tab => (
          <div
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer select-none
              ${activePanel === tab.id ? 'bg-primary-50 text-primary-700' : 'text-slate-500'}`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'chats' && totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 h-[600px]">

        {/* LEFT Ã¢â‚¬â€ Members list */}
        <div className={`w-full lg:w-72 flex-shrink-0 flex flex-col card p-0 overflow-hidden
          ${activePanel !== 'members' ? 'hidden lg:flex' : 'flex'}`}>

          <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-slate-800 text-sm">Members</span>
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {membersLoading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No members found</div>
            ) : filteredMembers.map(m => {
              const flat = flatLabel(m);
              const isSelected = selectedFlat?.toString() === flat.toString();
              const hasConv = conversations.some(c => c.flatNumber.toString() === flat.toString());
              const role = m.role?.toLowerCase() || 'owner';
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 select-none
                    ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[role] || AVATAR_COLORS.owner} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                    {initials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-800 truncate">{m.name || 'Ã¢â‚¬â€'}</span>
                      {hasConv && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-400">Flat {flat}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[role] || ROLE_COLORS.owner}`}>{m.role}</span>
                    </div>
                  </div>
                  <MessageCircle className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-500' : 'text-slate-300'}`} />
                </div>
              );
            })}
          </div>

          {conversations.length > 0 && (
            <div className="border-t border-slate-200 flex-shrink-0">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                Conversations ({conversations.length})
              </div>
              <div className="max-h-44 overflow-y-auto">
                {conversations.map(conv => (
                  <div
                    key={conv.flatNumber}
                    onClick={() => handleSelectConv(conv)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-slate-50 select-none
                      ${selectedFlat?.toString() === conv.flatNumber.toString() ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                      {String(conv.flatNumber).slice(0, 4)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-700">Flat {conv.flatNumber}</div>
                      <div className="text-xs text-slate-400 truncate">{conv.lastMessage}</div>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT Ã¢â‚¬â€ Chat window */}
        <div className={`flex-1 flex flex-col card p-0 overflow-hidden min-w-0
          ${activePanel !== 'chats' ? 'hidden lg:flex' : 'flex'}`}>

          {selectedFlat ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
                {selectedMember && (
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[selectedMember.role?.toLowerCase()] || AVATAR_COLORS.owner} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {initials(selectedMember.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm">{selectedMember?.name || `Flat ${selectedFlat}`}</div>
                  <div className="text-xs text-slate-400">Flat {selectedFlat}{selectedMember?.role ? ` Ã‚Â· ${selectedMember.role}` : ''}</div>
                </div>
                <div
                  onClick={() => { setSelectedFlat(null); setSelectedMember(null); setSelectedMessages([]); setActivePanel('members'); }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {selectedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageCircle className="w-10 h-10 text-slate-200 mb-2" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : selectedMessages.map((msg, i) => {
                  const isAdmin = msg.fromAdmin || msg.senderRole === 'admin';
                  const showDate = i === 0 || formatDate(selectedMessages[i - 1]?.timestamp) !== formatDate(msg.timestamp);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center text-xs text-slate-400 my-2">{formatDate(msg.timestamp)}</div>
                      )}
                      <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-2xl text-sm
                          ${isAdmin ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'}`}>
                          {!isAdmin && (
                            <div className="text-xs font-medium mb-1 text-primary-600">
                              {msg.senderName || `Flat ${msg.senderFlat}`}
                            </div>
                          )}
                          <p className="leading-relaxed break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isAdmin ? 'text-primary-200' : 'text-slate-400'}`}>{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-end gap-2 px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
                <textarea
                  rows={1}
                  placeholder={`Reply to Flat ${selectedFlat}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none text-slate-800 placeholder-slate-400 bg-white"
                  style={{ minHeight: '40px', maxHeight: '100px' }}
                />
                <div
                  onClick={handleSend}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                    ${sending || !replyText.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'}`}
                >
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageCircle className="w-14 h-14 text-slate-200 mb-3" />
              <p className="font-medium text-slate-500 text-center">Select a member to chat</p>
              <p className="text-sm mt-1 text-center">Pick any member from the list on the left.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}