const { chat } = require("../lib/llm");
const { webSearch } = require("../lib/search");
const { parseJSON } = require("../lib/json");
const { getSettings, requireUser } = require("../lib/firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const b = req.body || {};
  const user = await requireUser(req, res);
  if (!user) return;
  if (!b.businessName || !b.industry) {
    return res.status(400).json({ error: "businessName and industry are required" });
  }
  const keys = await getSettings(user.uid);

  const research = await webSearch(
    `${b.industry} SEO keywords ${b.competitors || ""} ${(Array.isArray(b.targetCountries) ? b.targetCountries : []).join(" ")}`.trim(),
    keys.tavilyKey
  );

  const prompt = `You are Hanora AI's SEO engine.

BUSINESS: ${b.businessName}
INDUSTRY: ${b.industry}
PRODUCTS/SERVICES: ${b.products || "n/a"}
COMPETITORS: ${b.competitors || "n/a"}
TARGET COUNTRIES: ${(Array.isArray(b.targetCountries) ? b.targetCountries : []).join(", ") || "n/a"}
WEBSITE: ${b.website || "n/a"}

RESEARCH
${research || "n/a"}

Respond with ONLY valid JSON, no markdown fences:
{
  "keywords": [{ "term": string, "intent": string }],
  "competitorKeywords": [string],
  "metaTitles": [string],
  "metaDescriptions": [string],
  "blogTopics": [string],
  "technicalSeoTips": [string],
  "internalLinkingTips": [string],
  "websiteSuggestions": [string]
}`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], keys.llm);
    const seo = parseJSON(raw);
    return res.status(200).json({ seo });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
