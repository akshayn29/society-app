import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";

export function useSuperAdmin() {
  const [societies, setSocieties] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const users = snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString() || "—",
      }));
      setAllUsers(users);
      const adminUsers = users.filter(u => u.role === "admin");
      setSocieties(adminUsers.map(u => ({
        id: u.id,
        name: u.societyName,
        address: u.societyAddress,
        totalFlats: u.totalFlats,
        adminName: u.name,
        adminEmail: u.email,
        adminPhone: u.phone,
        status: u.societyStatus || "active",
        createdAt: u.createdAt,
        uid: u.uid,
      })));
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "entries"), (snap) => {
      setAllEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snap) => {
      setAllBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  async function toggleSocietyStatus(adminUid, currentStatus) {
    await updateDoc(doc(db, "users", adminUid), {
      societyStatus: currentStatus === "active" ? "disabled" : "active",
    });
  }

  const stats = {
    totalSocieties:  societies.length,
    activeSocieties: societies.filter(s => s.status === "active").length,
    totalMembers:    allUsers.filter(u => u.role === "owner" || u.role === "tenant").length,
    totalEntries:    allEntries.length,
    totalBookings:   allBookings.length,
    totalGuards:     allUsers.filter(u => u.role === "guard").length,
  };

  return { societies, allUsers, allEntries, allBookings, loading, stats, toggleSocietyStatus };
}
