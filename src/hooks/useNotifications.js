import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export function useNotifications(uid) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "notifications"), where("recipientUid", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });
    return unsub;
  }, [uid]);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })));
  };

  const markRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  return { notifications, unreadCount, markAllRead, markRead };
}

export async function notifyStatusChange(raiserUid, complaintTitle, newStatus) {
  if (!raiserUid) return;
  await addDoc(collection(db, "notifications"), {
    recipientUid: raiserUid,
    type: "status_change",
    title: "Complaint Status Updated",
    message: `Your complaint "${complaintTitle}" is now ${newStatus === "inprogress" ? "In Progress" : newStatus}.`,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function notifyNewComment(raiserUid, commenterName, complaintTitle) {
  if (!raiserUid) return;
  await addDoc(collection(db, "notifications"), {
    recipientUid: raiserUid,
    type: "new_comment",
    title: "New Comment on Your Complaint",
    message: `${commenterName} replied on your complaint "${complaintTitle}".`,
    read: false,
    createdAt: serverTimestamp(),
  });
}
