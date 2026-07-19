const ADS_VERSION = "v24";

async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Google token refresh failed");
  return data.access_token;
}

function adsHeaders({ accessToken, developerToken, loginCustomerId }) {
  const h = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
  };
  if (loginCustomerId) h["login-customer-id"] = loginCustomerId;
  return h;
}

// Always creates the campaign PAUSED — real ad spend only starts once the user
// enables it themselves in the Google Ads UI. Not a corner cut, a deliberate gate.
async function createPausedCampaign({ google, name, dailyBudgetUsd, channelType }) {
  const accessToken = await getAccessToken(google);
  const headers = adsHeaders({ ...google, accessToken });
  const base = `https://googleads.googleapis.com/${ADS_VERSION}/customers/${google.customerId}`;

  const budgetRes = await fetch(`${base}/campaignBudgets:mutate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      operations: [{ create: {
        name: `${name} budget`,
        amountMicros: String(Math.round((dailyBudgetUsd || 10) * 1e6)),
        deliveryMethod: "STANDARD",
      } }],
    }),
  }).then(r => r.json());
  if (budgetRes.error) throw new Error(budgetRes.error.message || JSON.stringify(budgetRes.error));
  const budgetResourceName = budgetRes.results[0].resourceName;

  const campaignRes = await fetch(`${base}/campaigns:mutate`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      operations: [{ create: {
        name,
        status: "PAUSED",
        advertisingChannelType: channelType || "SEARCH",
        campaignBudget: budgetResourceName,
        networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true },
      } }],
    }),
  }).then(r => r.json());
  if (campaignRes.error) throw new Error(campaignRes.error.message || JSON.stringify(campaignRes.error));

  return { resourceName: campaignRes.results[0].resourceName, status: "PAUSED" };
}

async function getCampaignMetrics({ google }) {
  const accessToken = await getAccessToken(google);
  const headers = adsHeaders({ ...google, accessToken });
  const base = `https://googleads.googleapis.com/${ADS_VERSION}/customers/${google.customerId}`;
  const query = "SELECT campaign.id, campaign.name, campaign.status, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY campaign.id DESC LIMIT 20";
  const res = await fetch(`${base}/googleAds:search`, { method: "POST", headers, body: JSON.stringify({ query }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Google Ads metrics failed");
  return data.results || [];
}

module.exports = { createPausedCampaign, getCampaignMetrics };
