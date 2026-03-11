export async function onRequest(context: any) {
  // 从 Cloudflare 的环境变量中获取 API Key
  const apiKey = context.env.GLM_API_KEY || context.env.GEMINI_API_KEY || context.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API Key not configured on the server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 获取前端传过来的请求体内容（JSON格式的对话上下文）
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await context.request.json();
    
    // 转发请求给智谱 GLM 官方接口
    const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // 透传智谱的返回数据回前端
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        // 如果需要跨域访问可以在这里配置 CORS
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
