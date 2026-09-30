import { onRequest } from 'firebase-functions/v2/https';
import app from './app.js';

// Export Cloud Function as clientApi
export const clientApi = onRequest(
  {
    cors: true,
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60
  },
  app
);

export default app;
