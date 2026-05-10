import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';

export function useChats(societyCode) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyCode) return;
    const q = query(collection(db, 'chats'), where('societyCode', '==', societyCode), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [societyCode]);

  const sendMessage = async (message, senderFlat) => {
    await addDoc(collection(db, 'chats'), {
      societyCode,
      senderFlat,
      message,
      timestamp: new Date(),
      toAdmin: true
    });
  };

  return { chats, loading, sendMessage };
}