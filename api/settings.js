const { getSettings, publicSettings, requireUser, saveSettings } = require("../lib/firebase");
const { validatePublicHttpsUrl } = require("../lib/validation");

const text = value => typeof value === "string" ? value.trim().slice(0, 4000) : "";

module.exports = async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  try {
    if (req.method === "GET") return res.status(200).json({ settings: publicSettings(await getSettings(user.uid)) });
    if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });
    const b = req.body || {};
    const current = await getSettings(user.uid);
    if (b.llm?.baseURL && !validatePublicHttpsUrl(text(b.llm.baseURL))) return res.status(400).json({ error: "LLM base URL must be a public HTTPS endpoint" });
    const settings = {
      llm: { baseURL: text(b.llm?.baseURL), apiKey: text(b.llm?.apiKey) || current.llm?.apiKey || "", model: text(b.llm?.model) }, tavilyKey: text(b.tavilyKey) || current.tavilyKey || "",
      meta: { pageId: text(b.meta?.pageId), igUserId: text(b.meta?.igUserId), pageAccessToken: text(b.meta?.pageAccessToken) || current.meta?.pageAccessToken || "" },
      linkedin: { orgUrn: text(b.linkedin?.orgUrn), accessToken: text(b.linkedin?.accessToken) || current.linkedin?.accessToken || "" },
      google: { developerToken: text(b.google?.developerToken) || current.google?.developerToken || "", customerId: text(b.google?.customerId), clientId: text(b.google?.clientId), clientSecret: text(b.google?.clientSecret) || current.google?.clientSecret || "", refreshToken: text(b.google?.refreshToken) || current.google?.refreshToken || "", loginCustomerId: text(b.google?.loginCustomerId) },
    };
    await saveSettings(user.uid, settings);
    return res.status(200).json({ settings: publicSettings(settings) });
  } catch (e) { return res.status(502).json({ error: e.message }); }
};
