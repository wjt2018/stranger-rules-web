
// Initialize the client
import { InventoryItem } from '../App';

// --- Debug / Mock Configuration ---
const USE_MOCK = true; // Set to true to bypass API and use MOCK_RESPONSE
const MOCK_RESPONSE = "<narrative>\n冰冷的水流过你的指尖，让你瞬间从混沌中惊醒。你正俯身在一个老旧的陶瓷洗手池前，头痛欲裂，仿佛有无数不属于你的记忆碎片在脑内冲撞、拼接。\n\n你缓缓抬起头，看向面前布满水渍的镜子。镜中的人影，随着昏黄灯光的闪烁，显得既陌生又熟悉。那是一张苍白、瘦削的脸，眉眼深邃，鼻梁高挺，透着一股过劳的英俊。但这绝对不是你的脸。在你试图理解现状时，镜面忽然像一块老旧的CRT显示器般闪过几道雪花。紧接着，一行行像素风格的惨白文字，如同数字烙印般浮现在镜中倒影之上：\n\n【身份锚定：顾言】\n【回归之门开启条件：完成原主执念】\n【执念：在7日内，证明自己是公司里最有价值的员工。】\n【回归倒计时：168:00:00】\n\n你还没来得及消化这些信息，文字再次刷新，显现出更紧迫的内容：\n\n【第一日主题：傲慢 (Pride)】\n【今日任务：在今晚22:00的项目总结会上，让你的方案获得最高票数。】\n【任务失败：抹杀。】\n\n最后，几条血红色的规则浮现，带着不祥的气息，仿佛是这个世界的底层代码：\n【规则1：不要相信“镜子”里的话。】\n【规则2：办公室内禁止携带任何“红色”物品。】\n【规则3：如果“老板”对你微笑，请立刻低下头。】\n\n规则1和镜子上的文字形成了诡异的悖论，让你不寒而栗。就在这时，卫生间门外传来了一阵急促的手机铃声，打破了这令人窒息的寂静。铃声单调而执着，似乎已经响了很久。冰冷的空气中，你能闻到一丝劣质咖啡和打印机墨粉混合的味道，这里……似乎是个办公室的卫生间。时间紧迫，你必须做出选择。\n</narrative>\n\n<state_update>\n{\n  \"player_status\": { \"hp\": 100, \"san\": 80, \"credits\": 1250, \"current_status\": [\"头痛欲裂\", \"记忆混乱\", \"身份未知\"] },\n  \"player_info\": { \"name_now\": \"顾言\", \"identity\": \"某科技公司高级程序员\", \"name_old\": \"玩家\" },\n  \"time\": { \"day\": 1, \"time\": \"06:00\" },\n  \"inventory_status\": {\n    \"add\": [],\n    \"remove\": []\n  },\n  \"npc_status\": [],\n  \"shop_status\": [{ \"name\": \"拿铁\", \"price\": 50, \"desc\": \"可以提神的香浓咸咖啡\" },\n    { \"name\": \"工牌绳\", \"price\": 10, \"desc\": \"普通的工牌挂绳，但这不是你的名字\" },\n    { \"name\": \"口香糖\", \"price\": 5, \"desc\": \"薄荷味，可以让你保持清醒\" }],\n  \"quest_status\": {\n    \"daily_quest\": \"今日任务（傲慢）：在晚间22:00的项目总结会上，让你的方案获得最高票数。\",\n    \"stranger_rule\": \"【规则1：不要相信“镜子”里的话。】【规则2：办公室内禁止携带任何“红色”物品。】【规则3：如果“老板”对你微笑，请立刻低下头。】\"\n  },\n  \"suggested_actions\": [\n    { \"type\": \"logical\", \"label\": \"接听电话\", \"text\": \"我决定先走出卫生间，接听那个响个不停的电话，弄清楚现在的情况。\" },\n    { \"type\": \"twist\", \"label\": \"挑战规则\", \"text\": \"我决定再看一眼镜子，冲着里面的倒影说句话，试探一下规则1的虚实。\" },\n    { \"type\": \"aggressive\", \"label\": \"砸碎镜子\", \"text\": \"我攥紧拳头，不管三七二十一，先用力砸向这面诡异的镜子再说。\" },\n    { \"type\": \"romantic\", \"label\": \"整理仪容\", \"text\": \"我对着镜中这张英俊的脸，仔细整理发型和衣领，毕竟“傲慢”的第一步就是无可挑剔的形象。\" },\n    { \"type\": \"irony\", \"label\": \"感谢镜子\", \"text\": \"我对着镜子露出一个微笑，彬彬有礼地道谢，感谢它告诉我这些“不能相信”的关键信息。\" },\n    { \"type\": \"timeskip\", \"label\": \"冷静一下\", \"text\": \"我决定先不理会外界，用冷水泼脸，强迫自己在这狭小的空间里冷静几分钟。\" }\n  ],\n  \"meta_event\": \"game_start\"\n}\n</state_update>";

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
    time: string;
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
  player_status?: { hp?: number; san?: number; credits?: number; current_status?: string[] };
  player_info?: { name_now?: string; identity?: string; name_old?: string };
  time?: { day?: number; time?: string };
  inventory_status?: { add?: any[]; remove?: string[] };
  npc_status?: { name: string; favorability: number; last_interaction: number }[];
  shop_status?: { name: string, price: number, desc: string }[];
  quest_status?: { main_quest?: string, daily_quest?: string; stranger_rule?: string[] };
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
*   **Stats**: 玩家 HP/SAN 上限均为 100，下限为 0。player_status、inventory_status、npc_status、shop_status、quest_status 中返回的所有数值都是**当前绝对值（直接数值）**，而**不是变化量/差值**。例如 player_status.hp = 85 表示玩家当前 HP 为 85，而不是 HP 变化了 85。
*   **Current Status**: player_status.current_status 是字符串数组，描述主角当前的生理/心理/环境状态标签（如"轻度辐射"、"偏执 II"、"饥饿"）。每个状态不超过 5 个字。每次回复必须检查是否有状态变化（新增/移除/修改），若有则更新，若无则保持原样返回。该数组代表当前所有活跃状态的完整列表。
*   **Player Info**: player_info 仅在第一轮游戏开始时生成，后续不再变动，也不需要再次返回。包含 name_now（AI 为玩家生成的宿主名称，必须是一个合理的人名）、identity（宿主的身份介绍，一句话描述）、name_old（用户填写的原本名字，原样返回即可）。
*   **Social**: NPC 对穿书事实无知，始终基于原主身份互动。npc_status 格式为 [{name: "名字", favorability: 50, last_interaction: 0}, ...]。规则：
    - name: NPC 的身份和姓名
    - favorability: 该 NPC 对玩家的好感度（0-100）。若该 NPC 与原宿主认识，初始好感度应反映原先的关系（如好友=75，敌人=10，恋人=90，陌生人=50）。后续根据互动动态调整，每次的调整幅度为±5的范围之内。
    - last_interaction: 距离上一次出场的 AI 回复轮数。NPC 出场时设为 0，每轮未出场则 +1。当 last_interaction > 15 时，从 npc_status 中移除该 NPC。
    - 每次回复必须返回完整的 npc_status 数组（包含所有当前活跃 NPC）。
*   **Shop**: shop_status 格式为 [{ "name": "物品名", "price": 100, "desc": "描述" }, ...]。每次回复都可能刷新商店内容（根据剧情发展动态调整商品），数组长度不超过 15。每次回复必须返回完整的 shop_status 数组。物品应与当前世界观和剧情匹配，price 用信用点计价。
*   **Time**: time 字段以 \`{ "day": 1, "time": "08:30" }\` 格式返回当前游戏时间，day 为第几天，time 为 hh:mm 格式的24小时制时间。每次回复都必须返回当前时间。

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
  "player_status": { "hp": 95, "san": 99, "credits": 1000, "current_status": ["轻度疏离", "小伤"] },
  "player_info": { "name_now": "顾言", "identity": "某科技公司高级程序员", "name_old": "{{user}}" },
  "time": { "day": 1, "time": "08:30" },
  "inventory_status": {
    "add": [{ "name": "Strange Coin", "count": 1, "desc": "..." }],
    "remove": ["Bread"]
  },
  "npc_status": [
    { "name": "林小梅", "favorability": 75, "last_interaction": 0 },
    { "name": "老板张总", "favorability": 30, "last_interaction": 2 }
  ],
  "shop_status": [
    { "name": "拿铁", "price": 50, "desc": "可以提神的香浓咸咖啡" },
    { "name": "工牌绳", "price": 10, "desc": "普通的工牌挂绳，但这不是你的名字" },
    { "name": "口香糖", "price": 5, "desc": "薄荷味，可以让你保持清醒" }
  ],
  "quest_status": { "main_quest": "...", "daily_quest": "...", "stranger_rule": ["...", ...] },
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