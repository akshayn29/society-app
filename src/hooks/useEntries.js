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
      // Fetch all entries ordered by date — filter client-side by society
      q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
    } else {
      // Owner/tenant — only their flat
      q = query(
        collection(db, "entries"),
        where("flatNumber", "==", userProfile.flatNumber),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt:  d.data().createdAt?.toDate?.()?.toLocaleString("en-IN") || "Just now",
        approvedAt: d.data().approvedAt?.toDate?.()?.toLocaleString("en-IN") || null,
      }));

      // For admin/guard: filter by society
      if (userProfile.role === "admin" || userProfile.role === "guard") {
        const sc = userProfile.societyCode || userProfile.societyName || "";
        const sn = userProfile.societyName || userProfile.societyCode || "";
        data = data.filter(e =>
          e.societyCode === sc || e.societyCode === sn ||
          e.societyName === sc || e.societyName === sn ||
          sc === "" // fallback: show all if no society set
        );
      }

      setEntries(data);
      setLoading(false);
    }, (err) => {
      console.error("useEntries error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  async function addVisitor(visitorData) {
    await addDoc(collection(db, "entries"), {
      ...visitorData,
      societyCode: userProfile.societyCode || "",
      societyName: userProfile.societyName || "",
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
