export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || req.body?.apiKey;

  if (!apiKey) {
    return res.status(401).json({ error: "No API key configured. Add ANTHROPIC_API_KEY in Vercel Environment Variables." });
  }

  try {
    const { model, max_tokens, system, messages, tools } = req.body;
    const payload = { model, max_tokens, system, messages };
    if (tools && tools.length > 0) payload.tools = tools;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.type === "error") {
      const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
      return res.status(200).json({ error: msg });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(200).json({ error: "Server error: " + err.message });
  }
}
