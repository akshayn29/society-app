import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useTenants() {
  const { userProfile } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(collection(db, "tenants"), where("ownerUid", "==", userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id, ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || "—",
      }));
      setTenants(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userProfile]);

  async function addTenant(tenantData) {
    await addDoc(collection(db, "tenants"), {
      ...tenantData,
      ownerUid:    userProfile.uid,
      ownerName:   userProfile.name,
      flatNumber:  userProfile.flatNumber,
      wing:        userProfile.wing || "",
      societyCode: userProfile.societyCode,
      status:      "active",
      createdAt:   serverTimestamp(),
    });
  }

  async function removeTenant(tenantId) {
    await deleteDoc(doc(db, "tenants", tenantId));
  }

  return { tenants, loading, addTenant, removeTenant };
}
