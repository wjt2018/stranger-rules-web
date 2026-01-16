import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client
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
  message: string,
  config?: { model: string; temperature: number }
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: config?.model || 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: config?.temperature ?? 0.8,
        maxOutputTokens: 1000,
        thinkingConfig: { thinkingBudget: 200 },
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