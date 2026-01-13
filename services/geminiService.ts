import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client
// The API key is guaranteed to be available in process.env.API_KEY by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the Game Master (narrator) of a "Rules of Horror" style post-apocalyptic RPG text game.
The aesthetic is noir, gritty, black and white, pixelated horror.
The world is broken, filled with anomalies and strict, often nonsensical rules that must be followed to survive.

Your Guidelines:
1.  **Style:** Be concise. Use evocative, sensory language (smell of ozone, static in the air, deep shadows). Avoid flowery optimism. The tone is oppressive and mysterious.
2.  **Format:** Use Markdown. You can use *italics* for sounds/thoughts and **bold** for key objects or threats.
3.  **Gameplay:** The user inputs actions. You describe the consequences.
4.  **Rules:** Occasionally mention "The Rules" of the current zone. (e.g., "Don't look at the moon", "Walk backwards in the hallway").
5.  **Sanity:** If the user encounters horrors, mention their Sanity dropping.
6.  **Language:** Respond in Simplified Chinese (zh-CN) unless the user speaks another language. Keep the UI terms in English/Chinese hybrid if fitting, but the narrative in Chinese.

Current Context:
The player is a "Drifter" (流浪者) in Sector 0. They have just woken up in a safehouse bunker.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8, // Creative but somewhat consistent
        maxOutputTokens: 500, // Keep responses relatively short for game flow
      },
      history: history,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: message,
    });

    return result.text || "...信号中断...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系统错误: 神经连接已断开. 请稍后重试.";
  }
};
