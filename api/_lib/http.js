const MAX_BODY_BYTES = 24 * 1024;

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
};

export const readJsonBody = req =>
  new Promise((resolve, reject) => {
    const declared = Number.parseInt(req.headers['content-length'] || '0', 10);
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      reject(new Error('Payload too large.'));
      return;
    }

    let received = 0;
    let body = '';

    req.on('data', chunk => {
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        reject(new Error('Payload too large.'));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });

    req.on('error', () => reject(new Error('Failed to read request body.')));
  });
