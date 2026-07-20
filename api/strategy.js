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
  const countries = (Array.isArray(b.targetCountries) ? b.targetCountries : []).filter(c => typeof c === "string").slice(0, 50).join(", ");
  let research = "";
  try { research = await webSearch(`${b.industry} market trends competitors ${b.competitors || ""} ${countries}`.trim(), keys.tavilyKey); }
  catch (e) { return res.status(502).json({ error: `Research unavailable: ${e.message}` }); }

  const prompt = `You are Hanora AI's strategy engine. Given this business, produce a complete marketing strategy.

BUSINESS
Name: ${b.businessName}
Industry: ${b.industry}
Goals: ${b.goals || "n/a"}
Target audience: ${b.targetAudience || "n/a"}
Budget: ${b.budget || "n/a"}
Target countries: ${countries || "n/a"}
Products/services: ${b.products || "n/a"}
Competitors: ${b.competitors || "n/a"}
Brand guidelines / tone: ${b.brandGuidelines || "n/a"}
Social presence: ${b.socials ? Object.entries(b.socials).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ") || "n/a" : "n/a"}

MARKET RESEARCH
${research || "n/a"}

BUSINESS DOCUMENTS (provided by the user — treat as ground truth about their business)
${(b.documents || []).map(d => `--- ${d.name} ---\n${String(d.text || "").slice(0, 12000)}`).join("\n\n").slice(0, 50000) || "none provided"}

Respond with ONLY valid JSON, no markdown fences, matching this shape:
{
  "summary": string,
  "goToMarketPlan": string,
  "salesFunnel": string,
  "marketingFunnel": string,
  "budgetAllocation": [{ "channel": string, "percent": number, "reason": string }],
  "campaignTimeline": [{ "phase": string, "duration": string, "focus": string }],
  "platformRecommendations": [{ "platform": string, "reason": string }],
  "growthStrategy": string
}`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], keys.llm);
    const strategy = parseJSON(raw);
    return res.status(200).json({ strategy });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
