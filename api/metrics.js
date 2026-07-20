const meta = require("../lib/platforms/meta");
const linkedin = require("../lib/platforms/linkedin");
const google = require("../lib/platforms/google");
const { getSettings, requireUser } = require("../lib/firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const user = await requireUser(req, res);
  if (!user) return;
  const { targets } = req.body || {};
  if (!Array.isArray(targets) || !targets.length || targets.length > 20 || targets.some(t => !t || typeof t.platform !== "string")) return res.status(400).json({ error: "targets are required" });
  const keys = await getSettings(user.uid);

  const results = [];

  for (const t of targets) {
    try {
      if (t.platform === "Facebook" || t.platform === "Instagram") {
        const metrics = t.platform === "Facebook"
          ? ["post_impressions", "post_engaged_users", "post_clicks"]
          : ["impressions", "reach", "engagement"];
        const data = await meta.getInsights({ objectId: t.id, accessToken: keys.meta.pageAccessToken, metrics });
        results.push({ platform: t.platform, id: t.id, data });
      } else if (t.platform === "LinkedIn") {
        const data = await linkedin.getShareStats({ accessToken: keys.linkedin.accessToken, orgUrn: keys.linkedin.orgUrn });
        results.push({ platform: t.platform, data });
      } else if (t.platform === "Google Ads" || t.platform === "YouTube") {
        const data = await google.getCampaignMetrics({ google: keys.google });
        results.push({ platform: t.platform, data });
      }
    } catch (e) {
      results.push({ platform: t.platform, id: t.id, error: e.message });
    }
  }

  return res.status(200).json({ results });
};
