// ponytail: hardcoded version, LinkedIn requires current YYYYMM — bump this monthly
const LI_VERSION = "202601";

async function publishPost({ accessToken, orgUrn, text }) {
  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "LinkedIn-Version": LI_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: orgUrn,
      commentary: text,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn post failed ${res.status}: ${await res.text()}`);
  return { id: res.headers.get("x-restli-id") };
}

async function getShareStats({ accessToken, orgUrn }) {
  const url = `https://api.linkedin.com/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(orgUrn)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, "LinkedIn-Version": LI_VERSION },
  });
  if (!res.ok) throw new Error(`LinkedIn stats failed ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = { publishPost, getShareStats };
