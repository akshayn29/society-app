import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, updateDoc, doc, onSnapshot,
  query, where, serverTimestamp, getDocs, deleteDoc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useInvites() {
  const { userProfile } = useAuth();
  const [invites, setInvites]                   = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const q = query(
      collection(db, "invites"),
      where("invitedBy", "==", userProfile.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const q = query(
      collection(db, "users"),
      where("approverUid", "==", userProfile.uid),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPendingApprovals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userProfile]);

  async function createInvite({ email, flatNumber, role }) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const ref = await addDoc(collection(db, "invites"), {
      email,
      flatNumber,
      role,
      token,
      status: "pending",
      invitedBy:     userProfile.uid,
      invitedByName: userProfile.name,
      invitedByRole: userProfile.role,
      societyCode:   userProfile.societyCode,
      societyName:   userProfile.societyName || "",
      createdAt:     serverTimestamp(),
      expiresAt:     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { id: ref.id, token };
  }

  async function approveUser(userId) {
    await updateDoc(doc(db, "users", userId), {
      status: "active",
      approvedAt: serverTimestamp(),
    });
  }

  async function rejectUser(userId) {
    await updateDoc(doc(db, "users", userId), {
      status: "rejected",
      rejectedAt: serverTimestamp(),
    });
  }

  async function getInviteByToken(token) {
    const snap = await getDocs(
      query(collection(db, "invites"), where("token", "==", token))
    );
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  async function acceptInvite(inviteId) {
    await updateDoc(doc(db, "invites", inviteId), {
      status: "accepted",
      acceptedAt: serverTimestamp(),
    });
  }

  async function deleteInvite(inviteId) {
    await deleteDoc(doc(db, "invites", inviteId));
  }

  async function deactivateInvite(inviteId, comment) {
    await updateDoc(doc(db, "invites", inviteId), {
      status: "inactive",
      deactivatedAt: serverTimestamp(),
      deactivationComment: comment,
    });
  }

  return {
    invites, pendingApprovals, loading,
    createInvite, approveUser, rejectUser,
    getInviteByToken, acceptInvite,
    deleteInvite, deactivateInvite,
  };
}
