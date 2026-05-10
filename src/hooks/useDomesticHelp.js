import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export const useDomesticHelp = (societyCode) => {
  const [helpers, setHelpers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!societyCode) return;

    const helpQuery = query(
      collection(db, "domesticHelp"),
      where("societyCode", "==", societyCode)
    );

    const unsubscribeHelp = onSnapshot(helpQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHelpers(data);
      setLoading(false);
    });

    const attendanceQuery = query(
      collection(db, "domesticHelpAttendance"),
      where("societyCode", "==", societyCode)
    );

    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendance(data);
    });

    return () => {
      unsubscribeHelp();
      unsubscribeAttendance();
    };
  }, [societyCode]);

  const addHelper = async (helperData) => {
    try {
      await addDoc(collection(db, "domesticHelp"), {
        ...helperData,
        societyCode,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding helper:", error);
      throw error;
    }
  };

  const deleteHelper = async (helperId) => {
    try {
      await deleteDoc(doc(db, "domesticHelp", helperId));
    } catch (error) {
      console.error("Error deleting helper:", error);
      throw error;
    }
  };

  const markAttendance = async (helperId, helperName, status) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      // Check if attendance already marked today
      const existing = attendance.find(
        (a) => a.helperId === helperId && a.date === today
      );
      if (existing) {
        await updateDoc(doc(db, "domesticHelpAttendance", existing.id), {
          status,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "domesticHelpAttendance"), {
          helperId,
          helperName,
          societyCode,
          date: today,
          status,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  };

  const getTodayAttendance = (helperId) => {
    const today = new Date().toISOString().split("T")[0];
    return attendance.find((a) => a.helperId === helperId && a.date === today);
  };

  return {
    helpers,
    attendance,
    loading,
    addHelper,
    deleteHelper,
    markAttendance,
    getTodayAttendance,
  };
};
