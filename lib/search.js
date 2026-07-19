async function webSearch(query, tavilyKey) {
  const apiKey = tavilyKey || process.env.TAVILY_API_KEY;
  if (!apiKey) return "";
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, max_results: 5 }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.results.map(r => `- ${r.title}: ${r.content} (${r.url})`).join("\n");
}

module.exports = { webSearch };
