async function publishFacebookPost({ pageId, pageAccessToken, message }) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, access_token: pageAccessToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Facebook post failed");
  return data;
}

async function publishInstagramPost({ igUserId, pageAccessToken, caption, imageUrl }) {
  if (!imageUrl) throw new Error("Instagram feed posts require an image — creative generation isn't wired up yet, pass campaign.imageUrl manually");
  const create = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: pageAccessToken }),
  }).then(r => r.json());
  if (create.error) throw new Error(create.error.message);

  const publish = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: create.id, access_token: pageAccessToken }),
  }).then(r => r.json());
  if (publish.error) throw new Error(publish.error.message);
  return publish;
}

async function getInsights({ objectId, accessToken, metrics }) {
  const url = `https://graph.facebook.com/v19.0/${objectId}/insights?metric=${metrics.join(",")}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Meta insights fetch failed");
  return data.data;
}

module.exports = { publishFacebookPost, publishInstagramPost, getInsights };