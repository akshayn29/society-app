import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp, Timestamp
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
      const now = new Date();
      const data = snapshot.docs.map((d) => {
        const raw = d.data();
        const leaseExpiryDate = raw.leaseExpiry?.toDate?.() ?? null;
        const isExpired = leaseExpiryDate ? leaseExpiryDate < now : false;
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt?.toDate?.()?.toLocaleDateString() || "â€”",
          leaseExpiryDate,
          leaseExpiryFormatted: leaseExpiryDate
            ? leaseExpiryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : null,
          isExpired,
        };
      });
      data.sort((a, b) => (a.isExpired === b.isExpired ? 0 : a.isExpired ? 1 : -1));
      setTenants(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userProfile]);

  async function addTenant(tenantData) {
    const { leaseExpiry, ...rest } = tenantData;
    const leaseExpiryTimestamp = leaseExpiry
      ? Timestamp.fromDate(new Date(leaseExpiry + "T23:59:59"))
      : null;
    await addDoc(collection(db, "tenants"), {
      ...rest,
      leaseExpiry:  leaseExpiryTimestamp,
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

  const activeTenants  = tenants.filter((t) => !t.isExpired);
  const expiredTenants = tenants.filter((t) =>  t.isExpired);

  return { tenants, activeTenants, expiredTenants, loading, addTenant, removeTenant };
}
