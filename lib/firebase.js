const fs = require("fs");
const { applicationDefault, cert, getApp, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

function adminApp() {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"));
  return initializeApp(raw ? { credential: cert(JSON.parse(raw)) } : { credential: applicationDefault() });
}

function db() { return getFirestore(adminApp()); }

async function requireUser(req, res) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) { res.status(401).json({ error: "Sign in required" }); return null; }
  try { return await getAuth(adminApp()).verifyIdToken(token); }
  catch { res.status(401).json({ error: "Invalid or expired session" }); return null; }
}

async function getSettings(uid) {
  const store = db(), privateRef = store.doc(`users/${uid}/private/settings`), privateSnap = await privateRef.get();
  if (privateSnap.exists) return privateSnap.data();
  const legacyRef = store.collection("settings").doc(uid), legacySnap = await legacyRef.get();
  if (!legacySnap.exists) return {};
  await privateRef.set(legacySnap.data());
  await legacyRef.delete();
  return legacySnap.data();
}

async function saveSettings(uid, settings) { await db().doc(`users/${uid}/private/settings`).set(settings, { merge: true }); }

function publicSettings(settings) {
  return {
    llm: { baseURL: settings.llm?.baseURL || "", model: settings.llm?.model || "", configured: Boolean(settings.llm?.apiKey) },
    tavilyConfigured: Boolean(settings.tavilyKey),
    meta: { pageId: settings.meta?.pageId || "", igUserId: settings.meta?.igUserId || "", configured: Boolean(settings.meta?.pageAccessToken) },
    linkedin: { orgUrn: settings.linkedin?.orgUrn || "", configured: Boolean(settings.linkedin?.accessToken) },
    google: { customerId: settings.google?.customerId || "", clientId: settings.google?.clientId || "", loginCustomerId: settings.google?.loginCustomerId || "", configured: Boolean(settings.google?.refreshToken) },
  };
}

module.exports = { db, getSettings, publicSettings, requireUser, saveSettings };
