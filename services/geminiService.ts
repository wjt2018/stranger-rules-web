
// Initialize the client
import { InventoryItem } from '../App';

// --- Debug / Mock Configuration ---
const USE_MOCK = true; // Set to true to bypass API and use MOCK_RESPONSE
const MOCK_RESPONSE = "<narrative>\n冰冷的水流过你的指尖，让你瞬间从混沌中惊醒。你正俯身在一个老旧的陶瓷洗手池前，头痛欲裂，仿佛有无数不属于你的记忆碎片在脑内冲撞、拼接。\n\n你缓缓抬起头，看向面前布满水渍的镜子。镜中的人影，随着昏黄灯光的闪烁，显得既陌生又熟悉。那是一张苍白、瘦削的脸，眉眼深邃，鼻梁高挺，透着一股过劳的英俊。但这绝对不是你的脸。在你试图理解现状时，镜面忽然像一块老旧的CRT显示器般闪过几道雪花。紧接着，一行行像素风格的惨白文字，如同数字烙印般浮现在镜中倒影之上：\n\n【身份锚定：顾言】\n【回归之门开启条件：完成原主执念】\n【执念：在7日内，证明自己是公司里最有价值的员工。】\n【回归倒计时：168:00:00】\n\n你还没来得及消化这些信息，文字再次刷新，显现出更紧迫的内容：\n\n【第一日主题：傲慢 (Pride)】\n【今日任务：在今晚22:00的项目总结会上，让你的方案获得最高票数。】\n【任务失败：抹杀。】\n\n最后，几条血红色的规则浮现，带着不祥的气息，仿佛是这个世界的底层代码：\n【规则1：不要相信“镜子”里的话。】\n【规则2：办公室内禁止携带任何“红色”物品。】\n【规则3：如果“老板”对你微笑，请立刻低下头。】\n\n规则1和镜子上的文字形成了诡异的悖论，让你不寒而栗。就在这时，卫生间门外传来了一阵急促的手机铃声，打破了这令人窒息的寂静。铃声单调而执着，似乎已经响了很久。冰冷的空气中，你能闻到一丝劣质咖啡和打印机墨粉混合的味道，这里……似乎是个办公室的卫生间。时间紧迫，你必须做出选择。\n</narrative>\n\n<state_update>\n{\n  \"player_diff\": { \"hp\": 0, \"san\": 0, \"credits\": 0 },\n  \"time_passed\": 5,\n  \"inventory_diff\": {\n    \"add\": [],\n    \"remove\": []\n  },\n  \"npc_diff\": [],\n  \"shop_diff\": { \"refresh\": false },\n  \"quest_diff\": {\n    \"update_daily\": \"今日任务（傲慢）：在晚间22:00的项目总结会上，让你的方案获得最高票数。\",\n    \"stranger_rule\": \"【规则1：不要相信“镜子”里的话。】【规则2：办公室内禁止携带任何“红色”物品。】【规则3：如果“老板”对你微笑，请立刻低下头。】\"\n  },\n  \"suggested_actions\": [\n    { \"type\": \"logical\", \"label\": \"接听电话\", \"text\": \"我决定先走出卫生间，接听那个响个不停的电话，弄清楚现在的情况。\" },\n    { \"type\": \"twist\", \"label\": \"挑战规则\", \"text\": \"我决定再看一眼镜子，冲着里面的倒影说句话，试探一下规则1的虚实。\" },\n    { \"type\": \"aggressive\", \"label\": \"砸碎镜子\", \"text\": \"我攥紧拳头，不管三七二十一，先用力砸向这面诡异的镜子再说。\" },\n    { \"type\": \"romantic\", \"label\": \"整理仪容\", \"text\": \"我对着镜中这张英俊的脸，仔细整理发型和衣领，毕竟“傲慢”的第一步就是无可挑剔的形象。\" },\n    { \"type\": \"irony\", \"label\": \"感谢镜子\", \"text\": \"我对着镜子露出一个微笑，彬彬有礼地道谢，感谢它告诉我这些“不能相信”的关键信息。\" },\n    { \"type\": \"timeskip\", \"label\": \"冷静一下\", \"text\": \"我决定先不理会外界，用冷水泼脸，强迫自己在这狭小的空间里冷静几分钟。\" }\n  ],\n  \"meta_event\": \"game_start\"\n}\n</state_update>";

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
  player_status?: { hp?: number; san?: number; credits?: number };
  time_passed?: number;
  inventory_diff?: { add?: any[]; remove?: string[] };
  npc_diff?: any[];
  shop_updated?: { name: string, price: number, desc: string }[];
  quest_diff?: { main_quest?: string, update_daily?: string; stranger_rule?: string[] };
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
*   **Stats**: 玩家 HP/SAN 上限均为 100。返回的值为当前数值状态，而不是变化量。
*   **Social**: NPC 对穿书事实无知，始终基于原主身份互动。
*   **Shop**: 商店物品会随剧情变化。

#### B. GM 扮演守则 (Persona & Constraints)
*   **Role**: 即使是 GM，也不要以“系统”自居，而是融合在环境描述中。
*   **Agency (铁律)**: **严禁 (STRICTLY FORBIDDEN)** 替玩家做决定、替玩家说话、或描写玩家的心理活动。只描述外部环境反应。
*   **Language**: **必须**使用中文回复（专有名词除外）。
*   **Length**: 单次回复控制在 500-800 字之间，确保信息密度。
*   **Logic**: 严格遵循当前世界观物理法则，NPC 行为必须符合其人设逻辑。

#### C. 每日任务与规则 (Mission & Rules)
*   **Main Quest**: 需要达成的原宿主的执念，玩家必须在7天内完成，一般来说整个游戏中该任务不会变化。
*   **Daily Cycle**: 7 天轮替“七宗罪”主题 (傲慢 -> 嫉妒 -> ...)。当日主题深度改变次日剧情。
*   **Stranger Rule System**: 每个世界包含 3-7 条怪谈规则。一般情况下不会变更，除非剧情推荐。格式为字符串数组，更新时该数组应该包含所有的规则怪谈，并不是仅仅包含修改了的那一条。

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
    6.  **TimeSkip**: 快速略过时间/跳过当前场景进入下一个场景。

#### E. 输出协议与格式自查 (Output Protocol & CoT)

**Thinking Process (CoT)**:
在生成回复前，**必须**先进行思维链自查（Inner Monologue，不输出给用户）：
1.  **Format Check**: 是否包含了 <narrative> 和 <state_update>？
2.  **Agency Check**: 我是否替玩家做了决定？如果有，删除重写。
3.  **Rule Check**: 玩家行为是否触发了怪谈规则？
4.  **Action Check**: 是否生成了 6 个不同类型的行动建议？
5.  **State Update Check**: 状态更新是否合理？
6.  **Narrative Check**: 是否符合世界观？
7.  **Language Check**: 是否使用了中文？
8.  **Length Check**: 是否在 500-800 字之间？
9.  **Logic Check**: 是否符合逻辑？

**Response Schema (XML)**:
<narrative>
  (这里是 500-800 字的剧情描述。
  包含环境描写、NPC 对话、感官细节、剧情推进。)
</narrative>

<state_update>
{
  "player_diff": { "hp": 95, "san": 99, "credits": 1000 },
  "time_passed": 15,
  "inventory_diff": {
    "add": [{ "name": "Strange Coin", "count": 1, "desc": "..." }],
    "remove": ["Bread"]
  },
  "npc_diff": [],
  "shop_updated": [{"name": "...", "price": 100, "desc": "..."}, ...],
  "quest_diff": { "main_quest": "...", update_daily": "...", "stranger_rule": ["...", ...] },
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
  if (message) {
    prompt += `\n[User Input - 当前指令]\n${message}`;
  }
  
  // Implicit System Note if needed (can be logic based)
  if (gameState && gameState.player.hp < 20) {
    prompt += `\n[System Note: 玩家正处于极度虚弱状态，濒死体验]`;
  }

  return prompt;
};

// Helper: Parse Gemini XML Response
const parseGeminiResponse = (rawText: string): { text: string; stateUpdate?: StateUpdate } => {
  // XML Parsing Logic
  let narrative = rawText;
  let stateUpdate: StateUpdate | undefined;

  // Extract <narrative>
  // Support both greedy and lazy matching, usually lazy is safer but if content has newlines... 
  // [\s\S]*? is good.
  const narrativeMatch = rawText.match(/<narrative>([\s\S]*?)<\/narrative>/);
  if (narrativeMatch) {
    narrative = narrativeMatch[1].trim();
  }

  // Extract <state_update>
  const stateMatch = rawText.match(/<state_update>([\s\S]*?)<\/state_update>/);
  if (stateMatch) {
    try {
      stateUpdate = JSON.parse(stateMatch[1]);
    } catch (e) {
      console.error("Failed to parse state_update JSON:", e);
    }
  }

  // Fallback: If no XML tags found, treat whole text as narrative
  if (!narrativeMatch && !stateMatch) {
     narrative = rawText;
  }

  return { text: narrative, stateUpdate };
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
    // [MOCK MODE CHECK]
    if (USE_MOCK) {
      console.log("⚠️ Using MOCK_MODE Response");
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return parseGeminiResponse(MOCK_RESPONSE);
    }

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
        maxOutputTokens: 65536, // 64k
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
      return parseGeminiResponse(rawText);
    } else {
      return { text: "...信号干扰，无法解析数据..." };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { text: `系统错误: ${error.message}` };
  }
};