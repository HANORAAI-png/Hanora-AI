const PLATFORMS = new Set(["Facebook", "Instagram", "LinkedIn", "Google Ads", "YouTube"]);

function nonEmpty(value, max = 40000) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validateLaunch(campaign, platforms) {
  if (!campaign || typeof campaign !== "object" || Array.isArray(campaign)) return "campaign is required";
  if (!Array.isArray(platforms) || !platforms.length || platforms.length > PLATFORMS.size) return "platforms must be a non-empty array";
  if (new Set(platforms).size !== platforms.length || platforms.some(p => !PLATFORMS.has(p))) return "unsupported or duplicate platform";
  for (const platform of platforms) {
    const copy = platform === "Facebook" ? campaign.facebookCopy : platform === "Instagram" ? campaign.instagramCopy : platform === "LinkedIn" ? campaign.linkedinCopy : campaign.summary;
    if (!nonEmpty(copy)) return `${platform} needs approved campaign copy`;
  }
  if (platforms.includes("Instagram")) {
    if (!nonEmpty(campaign.imageUrl, 2000)) return "Instagram needs an image URL";
    try { if (new URL(campaign.imageUrl).protocol !== "https:") throw new Error(); } catch { return "Instagram image URL must be HTTPS"; }
  }
  if (platforms.includes("Google Ads") || platforms.includes("YouTube")) {
    const budget = Number(campaign.dailyBudgetUsd);
    if (!Number.isFinite(budget) || budget <= 0 || budget > 100000) return "dailyBudgetUsd must be between 0 and 100000";
  }
  return null;
}

function validatePublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.includes(".") && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(url.hostname);
  } catch { return false; }
}

module.exports = { PLATFORMS, nonEmpty, validateLaunch, validatePublicHttpsUrl };