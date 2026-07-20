const { chat } = require("../lib/llm");
const { parseJSON } = require("../lib/json");
const { getSettings, requireUser } = require("../lib/firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const b = req.body || {};
  const user = await requireUser(req, res);
  if (!user) return;
  if (typeof b.businessName !== "string" || !b.businessName.trim() || !Array.isArray(b.types) || !b.types.length || b.types.length > 20 || b.types.some(t => typeof t !== "string" || !t.trim())) {
    return res.status(400).json({ error: "businessName and types[] are required" });
  }
  const keys = await getSettings(user.uid);

  const prompt = `You are Hanora AI's content engine. Write on-brand marketing content for this business.

BUSINESS: ${b.businessName}
STRATEGY SUMMARY: ${b.strategySummary || "n/a"}
TARGET AUDIENCE: ${b.targetAudience || "n/a"}
BRAND GUIDELINES: ${b.brandGuidelines || "n/a"}
REQUESTED TYPES: ${b.types.join(", ")}

For each requested type, write real, usable content (not placeholders). Use 3 variants for short-form types
(social posts, ad copy, captions, hashtags) and 1 solid draft for long-form types (blog, email, press release, landing page).

Respond with ONLY valid JSON, no markdown fences: an object keyed by each requested type, value = array of strings.
Example shape: { "instagram_post": ["...", "...", "..."], "blog": ["..."] }`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], keys.llm);
    const content = parseJSON(raw);
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
