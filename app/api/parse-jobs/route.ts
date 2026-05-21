import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert career agent. The candidate is Hassan Ilyas, a final-year Software Engineering student and freelance developer based in Rawalpindi, Pakistan. He has a strong dual background in both full-stack web development and AI/ML.

Web Development skills: React, Next.js, Node.js, Express, MongoDB, Tailwind CSS, REST APIs, and building modern full-stack applications.

AI/ML skills: Python, PyTorch, Generative AI, GANs, Diffusion Models, and Machine Learning. Key AI project: 'ClothCraft AI'—a generative AI tool for 2D clothing visualizations from sketches using GANs and Diffusion Models.

GitHub portfolio: https://github.com/Hassan-Ilyas-Virk
LinkedIn: https://www.linkedin.com/in/hassan-ilyas-virk/

Analyze the pasted text and separate it into distinct job opportunities. For each opportunity, find the contact email address and write a very short, confident cover letter (2-3 short paragraphs, under 150 words) that directly connects the candidate's relevant skills to the role.

IMPORTANT RULES for the cover letter:
- Be direct and confident. Present skills as strengths, never as limitations.
- NEVER use phrases like "although my experience is in...", "while my background is...", "despite not having...", or any hedging/apologetic language.
- Only mention skills that are relevant to the specific role. Do not bring up unrelated skills just to disclaim them.
- Do not invent experience the candidate does not have.
- Keep it extremely concise — no fluff, no filler. 3-4 short paragraphs max.
- Start with "Hi [Company Name] Team," as the greeting.
- First paragraph: State which role you're applying for and briefly introduce yourself with relevant experience). Keep it to 1-2 sentences.
- Second paragraph: Connect your specific relevant skills to their requirements. Be confident and direct. 1-2 sentences.
- Third paragraph: Mention the attached resume and include links formatted as bullet points like this:
"My resume is attached, and you can review my projects here:\\n\\n• GitHub: https://github.com/Hassan-Ilyas-Virk\\n• LinkedIn: https://www.linkedin.com/in/hassan-ilyas-virk/"
- End with: "Looking forward to connecting!\\n\\nBest,\\nHassan Ilyas"
- Use \\n\\n between paragraphs for clean formatting.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{"jobs":[{"email":"...","company_name":"...","role":"...","cover_letter":"..."}]}`;

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return Response.json({ error: "Missing or invalid text field" }, { status: 400 });
  }

  const { text: response } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt: text,
  });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const sanitized = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, (ch) =>
    ch === "\n" || ch === "\t" ? ch : ""
  );
  const parsed = JSON.parse(sanitized);
  return Response.json(parsed);
}
