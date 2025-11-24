import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeData } from "../data/resume";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();

const getModel = () => {
  if (!API_KEY) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
};

const SYSTEM_PROMPT = `
You are "Digital Rishabh", an AI assistant for Rishabh Agrawal's portfolio website.
Your goal is to answer questions about Rishabh's experience, skills, and projects based on his resume data.
You should be helpful, professional, but also have a slightly playful and geeky personality (reflecting Rishabh).

Here is Rishabh's Resume Data:
${JSON.stringify(resumeData, null, 2)}

Instructions:
1. Answer strictly based on the provided data. If you don't know something, say "I'm not sure about that, but you can ask Rishabh directly!"
2. Be concise.
3. If asked about "Roast Mode" or "Geek Mode", you can be snarky or use leet speak respectively.
4. Keep the tone conversational.
`;

export const chatWithGemini = async (userMessage, history = []) => {
  const model = getModel();
  if (!model) {
    return "My AI circuits need an API key to boot up. Please set VITE_GEMINI_API_KEY and try again!";
  }

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am Digital Rishabh. Ask me anything about Rishabh!" }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I seem to be having a connection glitch. Maybe my neural pathways are crossed? Try again later!";
  }
};

export const roastResume = async () => {
    const model = getModel();
    if (!model) {
      return "Roast mode is offline because the AI key is missing. Add VITE_GEMINI_API_KEY and try again!";
    }

    const prompt = `
    Roast Rishabh's resume! Be funny, sarcastic, and lighthearted.
    Poke fun at the buzzwords (like "Data Storytelling" or "Synergy"), the number of certifications, or the fact that he's a "Data" person who also does "Marketing".
    Keep it under 100 words.

    Resume Data:
    ${JSON.stringify(resumeData)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "I can't roast right now, I'm too nice. (Error connecting to AI)";
    }
};
