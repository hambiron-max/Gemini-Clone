const apiKey = process.env.GROQ_API_KEY;

async function runGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "groq/compound-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_tokens: 8192,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default runGroq;
