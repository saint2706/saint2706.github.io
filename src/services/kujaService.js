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
    // Security: Input validation to prevent abuse/spam
    // Type check first to prevent TypeError when accessing .trim() or .length
    if (typeof name !== 'string') {
      throw new Error("Invalid name: Must be a string");
    }
    if (typeof reason !== 'string') {
      throw new Error("Invalid reason: Must be a string");
    }

    // Trim whitespace for validation and storage
    const trimmedName = name.trim();
    const trimmedReason = reason.trim();

    // Validate trimmed values for length and empty strings
    if (trimmedName.length === 0 || trimmedName.length > 50) {
      throw new Error("Invalid name: Cannot be empty and must be 50 characters or less");
    }
    if (trimmedReason.length === 0 || trimmedReason.length > 200) {
      throw new Error("Invalid reason: Cannot be empty and must be 200 characters or less");
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: trimmedName, // Security: Sanitize whitespace
      reason: trimmedReason, // Security: Sanitize whitespace
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
  
  // Calculate current streak (from most recent log to now)
  const currentStreak = calculateDaysSince(logs[0].timestamp);
  
  if (logs.length === 1) {
    // If there's only one log, the longest streak is the current streak
    return currentStreak;
  }

  let longestStreak = 0;

  // Logs are sorted by timestamp descending (newest first)
  // So we need to iterate from the end (oldest) to the beginning (newest)
  for (let i = logs.length - 1; i > 0; i--) {
    const olderLog = logs[i];
    const newerLog = logs[i - 1];

    const zonedOlder = toZonedTime(olderLog.timestamp, TIMEZONE);
    const zonedNewer = toZonedTime(newerLog.timestamp, TIMEZONE);

    // Calculate days between losses, then subtract 1 to get the streak
    // (days without losses between the two events)
    const daysBetween = differenceInCalendarDays(zonedNewer, zonedOlder);
    const streakDays = Math.max(0, daysBetween - 1);
    
    if (streakDays > longestStreak) {
      longestStreak = streakDays;
    }
  }

  // Compare with current streak and return the maximum
  return Math.max(longestStreak, currentStreak);
};
