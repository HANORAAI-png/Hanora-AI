const meta = require("../lib/platforms/meta");
const linkedin = require("../lib/platforms/linkedin");
const google = require("../lib/platforms/google");
const { createHash } = require("crypto");
const { db, getSettings, requireUser } = require("../lib/firebase");
const { validateLaunch } = require("../lib/validation");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const user = await requireUser(req, res);
  if (!user) return;
  const { campaign, platforms } = req.body || {};
  const validationError = validateLaunch(campaign, platforms);
  if (validationError) return res.status(400).json({ error: validationError });
  const keys = await getSettings(user.uid);
  const launchId = createHash("sha256").update(JSON.stringify({ campaign, platforms })).digest("hex");
  const launchRef = db().doc(`users/${user.uid}/launches/${launchId}`);
  try { await launchRef.create({ createdAt: new Date(), status: "publishing" }); }
  catch (error) {
    if (error.code !== 6 && error.code !== "6") {
      console.error("launch reservation error", error);
      return res.status(500).json({ error: "Could not reserve this launch" });
    }
    const prior = await launchRef.get();
    if (prior.exists && prior.data().results) return res.status(200).json({ results: prior.data().results, duplicate: true });
    return res.status(409).json({ error: "This campaign is already being published" });
  }

  const results = [];
  for (const platform of platforms) {
    try {
      if (platform === "Facebook") {
        if (!keys.meta?.pageId || !keys.meta?.pageAccessToken) throw new Error("Add your Meta page ID + access token in Settings");
        const detail = await meta.publishFacebookPost({ pageId: keys.meta.pageId, pageAccessToken: keys.meta.pageAccessToken, message: campaign.facebookCopy });
        results.push({ platform, status: "success", detail });
      } else if (platform === "Instagram") {
        if (!keys.meta?.igUserId || !keys.meta?.pageAccessToken) throw new Error("Add your Instagram business account ID + access token in Settings");
        const detail = await meta.publishInstagramPost({ igUserId: keys.meta.igUserId, pageAccessToken: keys.meta.pageAccessToken, caption: campaign.instagramCopy, imageUrl: campaign.imageUrl });
        results.push({ platform, status: "success", detail });
      } else if (platform === "LinkedIn") {
        if (!keys.linkedin?.accessToken || !keys.linkedin?.orgUrn) throw new Error("Add your LinkedIn access token + organization URN in Settings");
        const detail = await linkedin.publishPost({ accessToken: keys.linkedin.accessToken, orgUrn: keys.linkedin.orgUrn, text: campaign.linkedinCopy });
        results.push({ platform, status: "success", detail });
      } else {
        if (!keys.google?.refreshToken || !keys.google?.developerToken || !keys.google?.customerId) throw new Error("Add your Google Ads developer token, refresh token, and customer ID in Settings");
        const detail = await google.createPausedCampaign({ google: keys.google, name: `${campaign.businessName || "Hanora"} — ${platform} — ${new Date().toISOString().slice(0, 10)}`, dailyBudgetUsd: campaign.dailyBudgetUsd, channelType: platform === "YouTube" ? "VIDEO" : "SEARCH" });
        results.push({ platform, status: "success", detail, note: "Created PAUSED — enable it in Google Ads once you've reviewed it." });
      }
    } catch (error) {
      results.push({ platform, status: "error", detail: error.message || "Publishing failed" });
    }
  }

  await launchRef.set({ completedAt: new Date(), results, status: "complete" }, { merge: true });
  return res.status(200).json({ results });
};