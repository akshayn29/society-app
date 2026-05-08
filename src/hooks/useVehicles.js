import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection, addDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp, getDocs
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export function useVehicles() {
  const { userProfile } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const q = query(collection(db, "vehicles"), where("ownerUid", "==", userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userProfile]);

  async function addVehicle(vehicleData) {
    await addDoc(collection(db, "vehicles"), {
      ...vehicleData,
      ownerUid:    userProfile.uid,
      ownerName:   userProfile.name,
      flatNumber:  userProfile.flatNumber,
      wing:        userProfile.wing || "",
      societyCode: userProfile.societyCode,
      createdAt:   serverTimestamp(),
    });
  }

  async function removeVehicle(vehicleId) {
    await deleteDoc(doc(db, "vehicles", vehicleId));
  }

  async function searchByPlate(plate, societyCode) {
    const q = query(
      collection(db, "vehicles"),
      where("numberPlate", "==", plate.toUpperCase().replace(/\s/g, "")),
      where("societyCode", "==", societyCode)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  return { vehicles, loading, addVehicle, removeVehicle, searchByPlate };
}
