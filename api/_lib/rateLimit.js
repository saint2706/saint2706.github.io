const WINDOW_MS = 60_000;
const MAX_PER_IP = 30;
const MAX_PER_SESSION = 12;

const ipBuckets = new Map();
const sessionBuckets = new Map();

const now = () => Date.now();

const normalizeKey = value => (typeof value === 'string' && value.trim() ? value.trim() : 'anonymous');

const touchBucket = (store, key) => {
  const current = now();
  const bucket = store.get(key);

  if (!bucket || current - bucket.windowStart >= WINDOW_MS) {
    const next = { windowStart: current, count: 1 };
    store.set(key, next);
    return next;
  }

  bucket.count += 1;
  return bucket;
};

const gc = store => {
  const current = now();
  for (const [key, value] of store.entries()) {
    if (current - value.windowStart >= WINDOW_MS * 2) {
      store.delete(key);
    }
  }
};

setInterval(() => {
  gc(ipBuckets);
  gc(sessionBuckets);
}, WINDOW_MS).unref?.();

export const getClientIp = req => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown-ip';
};

export const getSessionId = req => {
  const sessionHeader = req.headers['x-session-id'];
  return normalizeKey(sessionHeader);
};

export const enforceRateLimit = (req, routeKey) => {
  const ipKey = `${routeKey}:${normalizeKey(getClientIp(req))}`;
  const sessionKey = `${routeKey}:${normalizeKey(getSessionId(req))}`;

  const ipBucket = touchBucket(ipBuckets, ipKey);
  if (ipBucket.count > MAX_PER_IP) {
    return { limited: true, message: 'Too many requests from this IP. Please wait a minute.' };
  }

  const sessionBucket = touchBucket(sessionBuckets, sessionKey);
  if (sessionBucket.count > MAX_PER_SESSION) {
    return { limited: true, message: 'Too many requests from this session. Please wait a minute.' };
  }

  return { limited: false };
};
