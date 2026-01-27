

// Initialize the client
// Client verification moved to function scope to prevent crash on load

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

export const fetchModelList = async (endpoint: string, apiKey: string): Promise<string[]> => {
  try {
    let baseUrl = endpoint || process.env.GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com";
    baseUrl = baseUrl.replace(/\/$/, "");
    
    // Explicitly check for key or env fallback
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      // If no key anywhere, throw specific error
      throw new Error("Missing API Key (System or Manual)");
    }

    const url = `${baseUrl}/v1beta/models?key=${key}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return (data.models || [])
      .filter((m: any) => m.name?.includes("gemini"))
      .map((m: any) => m.name.replace(/^models\//, ""));
  } catch (error) {
    console.error("Fetch models failed:", error);
    throw error;
  }
};

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  config?: { 
    model: string; 
    temperature: number;
    endpoint?: string;
    apiKey?: string;
  }
): Promise<string> => {
  try {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key is missing.");
      return "⚠️ 系统警告: 未检测到 API 密钥。请在“设置”中配置llm api key。";
    }

    let baseUrl = config?.endpoint || process.env.GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com";
    baseUrl = baseUrl.replace(/\/$/, "");
    
    // Default model fallback
    const model = config?.model || 'gemini-3-flash-preview';
    
    // Construct REST API URL
    const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Construct request body compliant with Gemini API
    const body = {
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: config?.temperature ?? 0.8,
        maxOutputTokens: 1000,
        // stopSequences: [],
        // candidateCount: 1,
        // thinkingConfig not supported in standard REST v1beta yet for all models, omitting for safety or include conditionally?
        // Let's omit thinkingConfig for generic compatibility unless strictly needed.
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error Response:", errText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    
    // Parse response
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      return data.candidates[0].content.parts.map((p: any) => p.text).join("");
    } else {
      console.warn("Unexpected response structure:", data);
      return "...信号干扰，无法解析数据...";
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `系统错误: 神经连接已断开 (${error.message || "Unknown error"}). 请检查设置 endpoint 和 key.`;
  }
};