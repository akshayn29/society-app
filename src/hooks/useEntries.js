import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, updateDoc, doc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useEntries() {
  const { userProfile } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    let q;
    if (userProfile.role === "admin" || userProfile.role === "guard") {
      q = query(
        collection(db, "entries"),
        where("societyCode", "==", userProfile.societyCode || userProfile.societyName),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "entries"),
        where("flatNumber", "==", userProfile.flatNumber),
        where("societyCode", "==", userProfile.societyCode),
        orderBy("createdAt", "desc")
      );
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString() || "Just now",
      }));
      setEntries(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userProfile]);

  async function addVisitor(visitorData) {
    await addDoc(collection(db, "entries"), {
      ...visitorData,
      societyCode: userProfile.societyCode,
      flatNumber:  userProfile.flatNumber,
      wing:        userProfile.wing || "",
      addedBy:     userProfile.name,
      addedByUid:  userProfile.uid,
      status:      "pending",
      createdAt:   serverTimestamp(),
    });
  }

  async function updateEntryStatus(entryId, status, guardName) {
    await updateDoc(doc(db, "entries", entryId), {
      status,
      approvedBy: guardName,
      approvedAt: serverTimestamp(),
    });
  }

  return { entries, loading, addVisitor, updateEntryStatus };
}
