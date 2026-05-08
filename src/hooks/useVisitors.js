import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, updateDoc, doc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useVisitors() {
  const { currentUser, userProfile } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !userProfile) return;

    let q;

    // Guard sees all visitors for their society
    if (userProfile.role === "guard") {
      q = query(
        collection(db, "visitors"),
        where("societyCode", "==", userProfile.societyCode),
        orderBy("createdAt", "desc")
      );
    }
    // Owner sees only their flat visitors
    else if (userProfile.role === "owner" || userProfile.role === "tenant") {
      q = query(
        collection(db, "visitors"),
        where("flatNumber", "==", userProfile.flatNumber),
        where("societyCode", "==", userProfile.societyCode),
        orderBy("createdAt", "desc")
      );
    } else {
      setLoading(false);
      return;
    }

    // Real time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitors(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userProfile]);

  // Add new visitor
  async function addVisitor(visitorData) {
    await addDoc(collection(db, "visitors"), {
      ...visitorData,
      societyCode: userProfile.societyCode,
      flatNumber:  userProfile.flatNumber,
      addedBy:     currentUser.uid,
      addedByName: userProfile.name,
      status:      "pending",
      createdAt:   serverTimestamp(),
    });
  }

  // Guard approves or denies
  async function updateVisitorStatus(visitorId, status, guardName) {
    await updateDoc(doc(db, "visitors", visitorId), {
      status,
      guardName,
      updatedAt: serverTimestamp(),
    });
  }

  return { visitors, loading, addVisitor, updateVisitorStatus };
}
