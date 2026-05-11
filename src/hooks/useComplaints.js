import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';

export function useComplaints(societyCode) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyCode) return;
    const q = query(collection(db, 'complaints'), where('societyCode', '==', societyCode));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [societyCode]);

  const raiseComplaint = async (complaintData) => {
    const { title, description, category, flatNumber, ownerName, societyCode } = complaintData;
    await addDoc(collection(db, 'complaints'), {
      societyCode,
      title,
      description,
      category,
      raisedByFlat: flatNumber,
      raisedByName: ownerName,
      status: 'pending',
      createdAt: new Date(),
      timestamp: new Date()
    });
  };

  const updateStatus = async (id, status) => {
    const docRef = doc(db, 'complaints', id);
    await updateDoc(docRef, { status });
  };

  return { complaints, loading, raiseComplaint, updateStatus };
}
