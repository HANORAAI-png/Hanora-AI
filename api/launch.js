const meta = require("../lib/platforms/meta");
const linkedin = require("../lib/platforms/linkedin");
const google = require("../lib/platforms/google");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { campaign, platforms, keys } = req.body || {};
  if (!campaign || !platforms?.length || !keys) {
    return res.status(400).json({ error: "campaign, platforms, and keys are required" });
  }

  const results = [];

  for (const platform of platforms) {
    try {
      if (platform === "Facebook") {
        if (!keys.meta?.pageId || !keys.meta?.pageAccessToken) throw new Error("Add your Meta page ID + access token in Settings");
        const r = await meta.publishFacebookPost({
          pageId: keys.meta.pageId,
          pageAccessToken: keys.meta.pageAccessToken,
          message: campaign.facebookCopy || campaign.summary,
        });
        results.push({ platform, status: "success", detail: r });
      } else if (platform === "Instagram") {
        if (!keys.meta?.igUserId || !keys.meta?.pageAccessToken) throw new Error("Add your Instagram business account ID + access token in Settings");
        const r = await meta.publishInstagramPost({
          igUserId: keys.meta.igUserId,
          pageAccessToken: keys.meta.pageAccessToken,
          caption: campaign.instagramCopy || campaign.summary,
          imageUrl: campaign.imageUrl,
        });
        results.push({ platform, status: "success", detail: r });
      } else if (platform === "LinkedIn") {
        if (!keys.linkedin?.accessToken || !keys.linkedin?.orgUrn) throw new Error("Add your LinkedIn access token + organization URN in Settings");
        const r = await linkedin.publishPost({
          accessToken: keys.linkedin.accessToken,
          orgUrn: keys.linkedin.orgUrn,
          text: campaign.linkedinCopy || campaign.summary,
        });
        results.push({ platform, status: "success", detail: r });
      } else if (platform === "Google Ads" || platform === "YouTube") {
        if (!keys.google?.refreshToken || !keys.google?.developerToken || !keys.google?.customerId) {
          throw new Error("Add your Google Ads developer token, refresh token, and customer ID in Settings");
        }
        const r = await google.createPausedCampaign({
          google: keys.google,
          name: `${campaign.businessName || "Hanora"} — ${platform} — ${new Date().toISOString().slice(0, 10)}`,
          dailyBudgetUsd: campaign.dailyBudgetUsd,
          channelType: platform === "YouTube" ? "VIDEO" : "SEARCH",
        });
        results.push({ platform, status: "success", detail: r, note: "Created PAUSED — enable it in Google Ads once you've reviewed it." });
      } else {
        results.push({ platform, status: "skipped", detail: "No integration for this platform yet" });
      }
    } catch (e) {
      results.push({ platform, status: "error", detail: e.message });
    }
  }

  return res.status(200).json({ results });
};
