const { chat } = require("../lib/llm");
const { webSearch } = require("../lib/search");
const { parseJSON } = require("../lib/json");

/**
 * Paid campaign-intelligence review.
 * Uses server env LLM keys by default (no login required for founding-offer testing).
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const b = req.body || {};
  const answers = b.answers || {};
  const targetCountry =
    b.targetCountry ||
    (Array.isArray(answers.countries) ? answers.countries[0] : answers.countries) ||
    answers.targetCountry;

  if (!targetCountry) {
    return res.status(400).json({ error: "targetCountry (or answers.countries) is required" });
  }

  const brief = [
    `Business: ${answers.businessName || "n/a"}`,
    `Industry: ${answers.industry || "n/a"}`,
    `Goals: ${answers.goals || "n/a"}`,
    `Audience: ${answers.audience || "n/a"}`,
    `Budget: ${answers.budget || "n/a"}`,
    `Countries: ${[].concat(answers.countries || targetCountry).join(", ")}`,
    `Products/Services: ${answers.products || "n/a"}`,
    `Competitors: ${answers.competitors || "n/a"}`,
    `Brand guidelines: ${answers.brand || "n/a"}`,
    `Campaign / offer: ${answers.campaign || "n/a"}`,
    `Tone: ${answers.tone || "n/a"}`,
    `Platforms: ${[].concat(answers.platforms || []).join(", ") || "n/a"}`,
    `Constraints: ${answers.constraints || "n/a"}`,
  ].join("\n");

  const research = await webSearch(
    `current events sensitive dates religious festivals political climate cultural marketing risks ${targetCountry} ${new Date().getFullYear()}`,
    process.env.TAVILY_API_KEY
  );

  const prompt = `You are Hanora AI's paid Campaign Intelligence analyst.
Produce a rich, graph-ready cultural risk review for a founding-offer client.

BUSINESS BRIEF
${brief}

PRIMARY MARKET: ${targetCountry}

LIVE CONTEXT
${research || "n/a"}

Analyze across six lenses: cultural, historical, religious, political, social, localization.
Respond with ONLY valid JSON (no markdown), matching this exact shape:
{
  "headline": string,
  "summary": string,
  "riskScore": number,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "localizationScore": number,
  "marketReadinessScore": number,
  "audiencePrediction": string,
  "lensScores": {
    "cultural": number,
    "historical": number,
    "religious": number,
    "political": number,
    "social": number,
    "localization": number
  },
  "lensNotes": {
    "cultural": string,
    "historical": string,
    "religious": string,
    "political": string,
    "social": string,
    "localization": string
  },
  "detectedIssues": [{ "lens": string, "issue": string, "severity": "low"|"medium"|"high", "impact": number }],
  "timelineRisks": [{ "label": string, "month": string, "severity": "low"|"medium"|"high", "note": string }],
  "audienceReaction": [{ "segment": string, "sentiment": number, "note": string }],
  "recommendation": string,
  "improvementCoach": string,
  "aiRewrite": string,
  "nextActions": [string, string, string]
}

Rules:
- All scores 0-100 (higher riskScore = riskier; higher lensScores = safer fit for that lens).
- timelineRisks: 4-6 culturally relevant moments for the market in the next year.
- audienceReaction: 3-5 segments with sentiment 0-100 (higher = more positive).
- Be specific to the brief and market. No generic filler.`;

  try {
    const raw = await chat([{ role: "user", content: prompt }], {
      baseURL: process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1",
      apiKey: process.env.LLM_API_KEY,
      model: process.env.LLM_MODEL || "openrouter/free",
    });
    const analysis = parseJSON(raw);
    return res.status(200).json({ analysis, market: targetCountry });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Analysis failed" });
  }
};
