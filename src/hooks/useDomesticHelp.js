import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, where, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useDomesticHelp() {
  const { userProfile } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  const societyCode = userProfile?.societyCode;

  useEffect(() => {
    if (!userProfile) return;
    let q;
    if (userProfile.role === "guard" || userProfile.role === "admin") {
      q = query(collection(db, "domesticHelp"), where("societyCode", "==", societyCode));
    } else {
      q = query(collection(db, "domesticHelp"), where("ownerUid", "==", userProfile.uid));
    }
    const unsub = onSnapshot(q, (snap) => {
      setHelpers(snap.docs.map(d => ({
        id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString() || "—",
      })));
      setLoading(false);
    });
    return unsub;
  }, [userProfile]);

  async function addHelper(data) {
    await addDoc(collection(db, "domesticHelp"), {
      ...data,
      ownerUid:    userProfile.uid,
      ownerName:   userProfile.name,
      flatNumber:  userProfile.flatNumber,
      wing:        userProfile.wing || "",
      societyCode: societyCode,
      status:      "active",
      createdAt:   serverTimestamp(),
    });
  }

  async function removeHelper(id) {
    await deleteDoc(doc(db, "domesticHelp", id));
  }

  async function toggleStatus(id, currentStatus) {
    await updateDoc(doc(db, "domesticHelp", id), {
      status: currentStatus === "active" ? "suspended" : "active",
    });
  }

  function isWorkingToday(workingDays) {
    if (!workingDays || workingDays.length === 0) return true;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = days[new Date().getDay()];
    return workingDays.includes(today);
  }

  const todaysHelpers = helpers.filter(h =>
    h.status === "active" && isWorkingToday(h.workingDays)
  );

  return { helpers, loading, todaysHelpers, addHelper, removeHelper, toggleStatus, isWorkingToday };
}
