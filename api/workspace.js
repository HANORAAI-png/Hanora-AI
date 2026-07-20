const { FieldValue } = require("firebase-admin/firestore");
const { db, requireUser } = require("../lib/firebase");

function clean(value, depth = 0) {
  if (value == null) return null;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.slice(0, 40000);
  if (depth > 6) return null;
  if (Array.isArray(value)) return value.slice(0, 100).map(v => clean(v, depth + 1));
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).slice(0, 100).map(([k, v]) => [k.slice(0, 100), clean(v, depth + 1)]));
  return null;
}

module.exports = async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const ref = db().doc(`users/${user.uid}/workspace/current`);
  try {
    if (req.method === "GET") {
      const snapshot = await ref.get();
      return res.status(200).json({ workspace: snapshot.exists ? snapshot.data() : null });
    }
    if (req.method !== "PUT") return res.status(405).json({ error: "GET or PUT only" });
    const body = req.body || {};
    const workspace = { flow: clean(body.flow), state: clean(body.state) };
    if (JSON.stringify(workspace).length > 900000) return res.status(413).json({ error: "Workspace is too large" });
    await ref.set({ ...workspace, updatedAt: FieldValue.serverTimestamp() });
    return res.status(204).end();
  } catch (error) {
    console.error("workspace error", error);
    return res.status(500).json({ error: "Could not access workspace" });
  }
};