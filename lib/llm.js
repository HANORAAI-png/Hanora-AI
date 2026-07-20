const { validatePublicHttpsUrl } = require("./validation");

async function chat(messages, llmKeys = {}) {
  const baseURL = llmKeys.baseURL || process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  const apiKey = llmKeys.apiKey || process.env.LLM_API_KEY;
  const model = llmKeys.model || process.env.LLM_MODEL || "openrouter/free";
  if (!validatePublicHttpsUrl(baseURL)) throw new Error("LLM base URL must be a public HTTPS endpoint");
  if (!apiKey) throw new Error("LLM API key is not configured");
  if (!model) throw new Error("LLM model is not configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const res = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.4 }),
      signal: controller.signal,
    });
    if (!res.ok) {
      let hint = "";
      if (res.status === 402 || res.status === 429) {
        hint = " - free model may be rate-limited or need credits; try openrouter/free or check OpenRouter credits";
      }
      throw new Error(`LLM request failed (${res.status})${hint}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new Error("LLM returned no content");
    return content;
  } finally { clearTimeout(timer); }
}

module.exports = { chat };
