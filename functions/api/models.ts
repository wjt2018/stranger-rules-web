export async function onRequest(context: any) {
  // 目前只有 Gemini 有比较方便的公开 /models 接口可以探测
  // 如果前端只是为了展示或者占位，我们可以直接 Mock 一个返回结果
  // 返回与实际智谱可用模型兼容的列表
  
  const mockModels = {
    models: [
      { name: "GLM-4.7-Flash" },
      { name: "GLM-4" },
      { name: "GLM-3-Turbo" }
    ]
  };

  return new Response(JSON.stringify(mockModels), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
