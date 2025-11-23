import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeData } from "../data/resume";

// NOTE: In a real production app, you should never expose API keys on the client side.
// However, for a GitHub Pages personal site without a backend, this is a known trade-off.
// The user is aware and has accepted this risk.
// We will apply simple obfuscation to prevent automated scrapers from easily grabbing it.

const P1 = "AIzaSyC5";
const P2 = "wCXlziQE";
const P3 = "fCvCmzNL";
const P4 = "BcdTUwBA";
const P5 = "aVIPDx8";

const API_KEY = `${P1}${P2}${P3}${P4}${P5}`;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
}
