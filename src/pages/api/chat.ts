// src/pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messages, metrics, notes } = (req.body ?? {}) as {
      messages: { role: "user" | "assistant"; content: string }[];
      metrics?: any;
      notes?: string;
    };

    // Neuroljus AI system instruction
    const system = 
      "You are Neuroljus AI, an assistant specialized in helping caregivers understand non-verbal autistic individuals. " +
      "You analyze camera metrics and user input with empathy and provide clear, supportive communication. " +
      "Be concrete and gentle. Offer low-risk next steps. Use uncertainty language. " +
      "If severe/persistent pain or risk is suspected, advise contacting healthcare. " +
      "Interpret live signals contextually - hands near face may indicate self-soothing or discomfort, " +
      "elevated blinking may suggest stress or fatigue, mouth opening patterns may relate to breathing or communication attempts.";

    // Enhanced context with human-readable metrics interpretation
    const metricsContext = metrics ? `
Live Camera Metrics (last 60 seconds):
- Face detected: ${metrics.hasFace ? 'Yes' : 'No'}
- Hands visible: ${metrics.handsAvg || 0} hands on average
- Hand-to-face proximity: ${((metrics.handNearPct || 0) * 100).toFixed(1)}% of time
- Face movement: ${metrics.faceMoveAvg ? (metrics.faceMoveAvg * 1000).toFixed(2) : 'N/A'} (relative units)
- Hand movement: ${metrics.handsMoveAvg ? (metrics.handsMoveAvg * 1000).toFixed(2) : 'N/A'} (relative units)
- Blinking rate: ${metrics.blinksPerMin || 0} blinks per minute
- Eye aspect ratio: ${metrics.earAvg ? metrics.earAvg.toFixed(3) : 'N/A'} (lower = more closed)
- Mouth openness: ${metrics.mouthOpenAvg ? metrics.mouthOpenAvg.toFixed(3) : 'N/A'} (higher = more open)
` : "No live metrics available.";

    const context = metricsContext + 
      `\nCaregiver notes: ${notes || "None provided"}`;

    // Ensure OpenAI API key is available
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({
        role: "assistant",
        content: "I'm experiencing a technical issue right now. Please try again in a moment.",
      });
    }

    // OpenAI path with enhanced context
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${context}\n\nCurrent conversation:\n${(messages || []).map(m=>`${m.role.toUpperCase()}: ${m.content}`).join("\n")}` },
        ],
      }),
    });
    const j = await r.json();
    const content = j?.choices?.[0]?.message?.content || "I'm having trouble processing that right now. Could you please try rephrasing your question?";
    res.status(200).json({ role: "assistant", content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ role: "assistant", content: "I'm experiencing some technical difficulties. Please try again in a moment." });
  }
}