async function chat(messages, llmKeys = {}) {
  const baseURL = llmKeys.baseURL || process.env.LLM_BASE_URL;
  const apiKey = llmKeys.apiKey || process.env.LLM_API_KEY;
  const model = llmKeys.model || process.env.LLM_MODEL;
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { chat };
