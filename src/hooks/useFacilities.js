import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp, getDocs
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useFacilities() {
  const { userProfile } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const societyCode = userProfile?.societyCode || userProfile?.societyName;

  useEffect(() => {
    if (!societyCode) return;
    const q = query(collection(db, "facilities"), where("societyCode", "==", societyCode));
    const unsub = onSnapshot(q, (snap) => {
      setFacilities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [societyCode]);

  useEffect(() => {
    if (!societyCode) return;
    const q = query(collection(db, "bookings"), where("societyCode", "==", societyCode));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleString() || "—",
      })));
    });
    return unsub;
  }, [societyCode]);

  async function addFacility(data) {
    await addDoc(collection(db, "facilities"), {
      ...data, societyCode, createdAt: serverTimestamp(),
    });
  }

  async function deleteFacility(id) {
    await deleteDoc(doc(db, "facilities", id));
  }

  async function bookFacility(facilityId, facilityName, date, slot) {
    const q = query(
      collection(db, "bookings"),
      where("facilityId", "==", facilityId),
      where("date", "==", date),
      where("slot", "==", slot),
      where("status", "==", "confirmed")
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error("Slot already booked");
    await addDoc(collection(db, "bookings"), {
      facilityId, facilityName, date, slot, societyCode,
      bookedBy:    userProfile.name,
      bookedByUid: userProfile.uid,
      flatNumber:  userProfile.flatNumber || "—",
      status:      "confirmed",
      createdAt:   serverTimestamp(),
    });
  }

  async function cancelBooking(bookingId) {
    await deleteDoc(doc(db, "bookings", bookingId));
  }

  function getSlotBookings(facilityId, date) {
    return bookings.filter(b =>
      b.facilityId === facilityId && b.date === date && b.status === "confirmed"
    );
  }

  const myBookings = bookings.filter(b => b.bookedByUid === userProfile?.uid);

  return {
    facilities, bookings, myBookings, loading,
    addFacility, deleteFacility, bookFacility, cancelBooking, getSlotBookings
  };
}
