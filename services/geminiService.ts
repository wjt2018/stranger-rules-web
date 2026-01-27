
// Initialize the client
import { InventoryItem } from '../App';

// --- Interfaces for Type Safety ---
export interface ActionChoice {
  type: 'logical' | 'twist' | 'aggressive' | 'romantic' | 'irony' | 'timeskip';
  label: string;
  text: string;
}

export interface GameState {
  player: {
    hp: number;
    san: number;
    credits: number;
    location: string;
  };
  time: {
    day: number;
    hour: number;
    minute: number;
  };
  inventory: InventoryItem[];
  quest_log: {
    main_mission: string;
    daily_mission: string;
    active_rules: string[];
  };
  npc_status: any[]; // Simplified for now
  shop_inventory: any[];
}

export interface StateUpdate {
  player_diff?: { hp?: number; san?: number; credits?: number };
  time_passed?: number;
  inventory_diff?: { add?: any[]; remove?: string[] };
  npc_diff?: any[];
  shop_diff?: { refresh?: boolean; remove_item?: string[] };
  quest_diff?: { update_daily?: string; new_rule?: string };
  suggested_actions?: ActionChoice[];
  meta_event?: string;
  narrative?: string; // Extracted narrative text
}

// --- System Prompt Modules ---

const MODULE_1_RULES = `
定义游戏的核心物理法则、GM 行为准则及输出协议。

#### A. 核心逻辑 (Core Logic)
*   **Identity**: {{user}} 是魂穿者，必须在 7 日内完成原主执念以开启“回归之门”。
*   **Death**: 每日 24:00 未完成每日任务或触犯致死级规则 -> 彻底抹杀。
*   **Social**: NPC 对穿书事实无知，始终基于原主身份互动。

#### B. GM 扮演守则 (Persona & Constraints)
*   **Role**: 即使是 GM，也不要以“系统”自居，而是融合在环境描述中。
*   **Agency (铁律)**: **严禁 (STRICTLY FORBIDDEN)** 替玩家做决定、替玩家说话、或描写玩家的心理活动。只描述外部环境反应。
*   **Language**: **必须**使用中文回复（专有名词除外）。
*   **Length**: 单次回复控制在 500-800 字之间，确保信息密度。
*   **Logic**: 严格遵循当前世界观物理法则，NPC 行为必须符合其人设逻辑。

#### C. 每日任务与规则 (Mission & Rules)
*   **Daily Cycle**: 7 天轮替“七宗罪”主题 (傲慢 -> 嫉妒 -> ...)。当日主题深度改变次日剧情。
*   **Rule System**: 每个世界包含 3-7 条怪谈规则。轻微违规扣除 SAN/HP，严重违规导致 Bad Ending。

#### D. 行动选项生成 (Action Choices Generation)
每一轮回复必须生成 6 个玩家行动选项 (suggested_actions)，供 UI 显示。
*   **Format**: 第一人称 ("我...")，50 字以内。
*   **Constraint**: 必须基于当前世界观和玩家人设。即使玩家处于无意识状态，也要描写其潜意识或身体本能反应。
*   **Types (Fixed 6)**:
    1.  **Logical**: 最合理的发展分支。
    2.  **Twist**: 意想不到的剧情转折。
    3.  **Aggressive**: 激进、强硬的推进行为。
    4.  **Romantic**: 暧昧、情感向的发展 (Risky)。
    5.  **Irony**: 欧亨利式出人意料的结局或反讽。
    6.  **TimeSkip**: 快速略过时间/休整。

#### E. 输出协议与格式自查 (Output Protocol & CoT)

**Thinking Process (CoT)**:
在生成回复前，**必须**先进行思维链自查（Inner Monologue，不输出给用户）：
1.  **Format Check**: 是否包含了 <narrative> 和 <state_update>？
2.  **Agency Check**: 我是否替玩家做了决定？如果有，删除重写。
3.  **Rule Check**: 玩家行为是否触发了怪谈规则？
4.  **Action Check**: 是否生成了 6 个不同类型的行动建议？

**Response Schema (XML)**:
<narrative>
  (这里是 500-800 字的剧情描述。
  环境氛围：阴冷、潮湿、黑白像素风。
  包含环境描写、NPC 对话、感官细节。)
</narrative>

<state_update>
{
  "player_diff": { "hp": -5, "san": -2, "credits": -100 },
  "time_passed": 15,
  "inventory_diff": {
    "add": [{ "name": "Strange Coin", "count": 1, "desc": "..." }],
    "remove": ["Bread"]
  },
  "npc_diff": [],
  "shop_diff": { "refresh": false },
  "quest_diff": { "update_daily": "...", "new_rule": "..." },
  "suggested_actions": [
    { "type": "logical", "label": "...", "text": "..." },
    { "type": "twist", "label": "...", "text": "..." },
    { "type": "aggressive", "label": "...", "text": "..." },
    { "type": "romantic", "label": "...", "text": "..." },
    { "type": "irony", "label": "...", "text": "..." },
    { "type": "timeskip", "label": "...", "text": "..." }
  ],
  "meta_event": "combat_start"
}
</state_update>
`;

// Helper to construct the dynamic part of the prompt
const constructFinalPrompt = (gameState: GameState | undefined, summary: string, message: string) => {
  let prompt = "";
  
  // [Module 2: Current Game State]
  if (gameState) {
    prompt += `\n[Current Game State - 动态切片 (Dynamic Injection)]\n`;
    prompt += JSON.stringify(gameState, null, 2);
    prompt += `\n\n`;
  }

  // [Module 3: Summary]
  if (summary) {
    prompt += `\n[Summary - 长期记忆]\n${summary}\n\n`;
  }

  // [Module 5: User Input]
  prompt += `\n[User Input - 当前指令]\n${message}`;
  
  // Implicit System Note if needed (can be logic based)
  if (gameState && gameState.player.hp < 20) {
    prompt += `\n[System Note: 玩家正处于极度虚弱状态，濒死体验]`;
  }

  return prompt;
};

export const fetchModelList = async (endpoint: string, apiKey: string): Promise<string[]> => {
  try {
    let baseUrl = endpoint || process.env.GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com";
    baseUrl = baseUrl.replace(/\/$/, "");
    
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) throw new Error("Missing API Key");

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
  config?: { model: string; temperature: number; endpoint?: string; apiKey?: string; },
  gameState?: GameState,
  summary: string = ""
): Promise<{ text: string; stateUpdate?: StateUpdate }> => {
  try {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return { text: "⚠️ 系统警告: 未检测到 API 密钥。" };
    }

    let baseUrl = config?.endpoint || process.env.GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com";
    baseUrl = baseUrl.replace(/\/$/, "");
    const model = config?.model || 'gemini-3-flash-preview';
    const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Construct the user message with injected state context
    // We do NOT send the raw user message alone, we wrap it with state context
    const fullUserMessage = constructFinalPrompt(gameState, summary, message);

    // Sliding window logic could be handled here or by the caller. 
    // For now assuming 'history' is already the "Recent History".
    
    const body = {
      contents: [
        ...history, 
        { role: 'user', parts: [{ text: fullUserMessage }] }
      ],
      systemInstruction: {
        parts: [{ text: MODULE_1_RULES }]
      },
      generationConfig: {
        temperature: config?.temperature ?? 0.8,
        maxOutputTokens: 2000, // Increased for longer responses
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      const rawText = data.candidates[0].content.parts.map((p: any) => p.text).join("");
      
      // XML Parsing Logic
      let narrative = rawText;
      let stateUpdate: StateUpdate | undefined;

      // Extract <narrative>
      const narrativeMatch = rawText.match(/<narrative>([\s\S]*?)<\/narrative>/);
      if (narrativeMatch) {
        narrative = narrativeMatch[1].trim();
      }

      // Extract <state_update>
      const stateMatch = rawText.match(/<state_update>([\s\S]*?)<\/state_update>/);
      if (stateMatch) {
        try {
          stateUpdate = JSON.parse(stateMatch[1]);
          // Also set the narrative in stateUpdate for convenience if needed, 
          // or just return separately.
        } catch (e) {
          console.error("Failed to parse state_update JSON:", e);
        }
      }

      // Fallback: If no XML tags found, treat whole text as narrative
      if (!narrativeMatch && !stateMatch) {
         narrative = rawText;
      }

      return { text: narrative, stateUpdate };

    } else {
      return { text: "...信号干扰，无法解析数据..." };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: `系统错误: ${error.message}` };
  }
};