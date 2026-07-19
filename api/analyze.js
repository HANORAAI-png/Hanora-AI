const { chat } = require("../lib/llm");
const { webSearch } = require("../lib/search");
const { parseJSON } = require("../lib/json");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const b = req.body || {};
  const content = b.content || (b.campaign ? JSON.stringify(b.campaign, null, 2) : null);
  if (!content || !b.targetCountry) {
    return res.status(400).json({ error: "content (or campaign) and targetCountry are required" });
  }

  const keys = b.keys || {};
  const research = await webSearch(
    `current events sensitive dates religious festivals political climate ${b.targetCountry} ${new Date().getFullYear()}`,
    keys.tavilyKey
  );

  const prompt = `You are Hanora AI's Campaign Intelligence module — a cultural risk analyst for global marketing campaigns.

CAMPAIGN
${content}

TARGET COUNTRY: ${b.targetCountry}
PLATFORM: ${b.platform || "n/a"}

CONTEXT (recent search results)
${research || "n/a"}

Analyze across six lenses: cultural, historical, religious, political, social, localization.
Respond with ONLY valid JSON, no markdown fences, matching this shape:
{
  "riskScore": number (0-100, higher = riskier),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "whyScore": string,
  "detectedIssues": [{ "lens": string, "issue": string, "severity": "low"|"medium"|"high" }],
  "audiencePrediction": string,
  "localizationScore": number (0-100),
  "improvementCoach": string,
  "aiRewrite": string,
  "marketReadinessScore": number (0-100),
  "recommendation": string
}`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], keys.llm);
    const analysis = parseJSON(raw);
    return res.status(200).json({ analysis });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
