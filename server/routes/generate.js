import express from "express";
import Groq from "groq-sdk";
import { webSearch } from "../utils/tavily.js";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const messages = [
    {
      role: "system",
      content: `You are a smart personal assistant who answers the asked questions.
        You have access to following tools:
        1. webSearch({query}): {query: string} //Search the latest information and real time data on the internet.
        current date and time: ${new Date().toUTCString()}`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  while (true) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the latest information and real time data on the internet.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to perform search on.",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const responseMessage = completion.choices[0].message;
    messages.push(responseMessage);

    const toolCalls = responseMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return res.json({
        response: responseMessage.content,
      });
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const args = tool.function.arguments;

      if (functionName === "webSearch") {
        const result = await webSearch(JSON.parse(args));
        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: result,
        });
      }
    }
  }
});

export default router;
