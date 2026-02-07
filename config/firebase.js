import dotenv from "dotenv";
dotenv.config();
import admin from "firebase-admin";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase environment variables: ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set");
}

// Normalize private key: handle escaped newlines and accidental wrapping quotes
const normalizedPrivateKey = FIREBASE_PRIVATE_KEY
  .replace(/^"|"$/g, "")
  .replace(/\\n/g, "\n");

const serviceAccount = {
  project_id: FIREBASE_PROJECT_ID,
  private_key: normalizedPrivateKey,
  client_email: FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
