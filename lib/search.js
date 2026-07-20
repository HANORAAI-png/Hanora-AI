async function webSearch(query, tavilyKey) {
  const apiKey = tavilyKey || process.env.TAVILY_API_KEY;
  if (!apiKey) return "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, query: String(query).slice(0, 2000), max_results: 5 }),
      signal: controller.signal,
    });
    if (!res.ok) return "";
    const data = await res.json();
    return (data.results || []).map(r => `- ${r.title}: ${r.content} (${r.url})`).join("\n");
  } catch { return ""; }
  finally { clearTimeout(timer); }
}

module.exports = { webSearch };