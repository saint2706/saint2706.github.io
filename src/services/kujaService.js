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

export const calculateLongestStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;
  if (logs.length === 1) {
    // If there's only one log, the longest streak is the time from that log to now
    return calculateDaysSince(logs[0].timestamp);
  }

  let longestStreak = 0;

  // Logs are sorted by timestamp descending (newest first)
  // So we need to iterate from the end (oldest) to the beginning (newest)
  for (let i = logs.length - 1; i > 0; i--) {
    const olderLog = logs[i];
    const newerLog = logs[i - 1];

    const zonedOlder = toZonedTime(olderLog.timestamp, TIMEZONE);
    const zonedNewer = toZonedTime(newerLog.timestamp, TIMEZONE);

    const streakDays = differenceInCalendarDays(zonedNewer, zonedOlder);
    
    if (streakDays > longestStreak) {
      longestStreak = streakDays;
    }
  }

  // Also check the current streak (from most recent log to now)
  const currentStreak = calculateDaysSince(logs[0].timestamp);
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return longestStreak;
};
