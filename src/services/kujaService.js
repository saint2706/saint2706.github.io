import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { differenceInCalendarDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const COLLECTION_NAME = 'kuja_logs';
const TIMEZONE = 'Asia/Kolkata'; // IST

export const getLogs = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date if it exists
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date()
    }));
  } catch (error) {
    console.error("Error fetching logs: ", error);
    // If we're offline or config is bad, return empty array to prevent crash
    return [];
  }
};

export const addLog = async (name, reason) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name,
      reason,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding log: ", error);
    throw error;
  }
};

export const calculateDaysSince = (lastDate) => {
  if (!lastDate) return 0;

  const now = new Date();

  // Convert both dates to IST for accurate calendar day calculation
  const zonedLast = toZonedTime(lastDate, TIMEZONE);
  const zonedNow = toZonedTime(now, TIMEZONE);

  return differenceInCalendarDays(zonedNow, zonedLast);
};
