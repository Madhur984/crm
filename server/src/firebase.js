import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import fileDirName from 'file-dirname';

const [, __dirname] = fileDirName();

let db = null;

export function getFirestoreDB() {
  if (db) return db;

  if (admin.apps.length === 0) {
    let credential;

    // Option 1: Inline JSON in environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(serviceAccount);
      } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
      }
    }

    // Option 2: Path to serviceAccountKey.json
    if (!credential) {
      const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../serviceAccountKey.json');
      if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
      }
    }

    // Option 3: Default application credentials
    if (!credential) {
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }

  db = admin.firestore();
  return db;
}

export { admin };
