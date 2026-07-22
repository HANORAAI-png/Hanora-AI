const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../lib/firebase");
const { isValidEmail } = require("../lib/validation");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { name, email, source } = req.body || {};
  if (typeof name !== "string" || !name.trim() || name.length > 200) return res.status(400).json({ error: "Enter your name" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Enter a valid email" });
  const cleanEmail = email.trim().toLowerCase();
  try {
    const ref = db().collection("presignups").doc(cleanEmail);
    const snap = await ref.get();
    await ref.set({
      name: name.trim().slice(0, 200),
      email: cleanEmail,
      source: typeof source === "string" ? source.slice(0, 300) : "",
      updatedAt: FieldValue.serverTimestamp(),
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("presignup error", error);
    return res.status(500).json({ error: "Could not save your details" });
  }
};
