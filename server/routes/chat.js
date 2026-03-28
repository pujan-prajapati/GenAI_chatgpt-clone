import express from "express";
import Groq from "groq-sdk";
import { webSearch } from "../utils/tavily.js";
import NodeCache from "node-cache";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // Cache results for 24 hours

router.post("/chat", async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;

    if (!prompt || !sessionId) {
      return res
        .status(400)
        .json({ error: "Prompt and sessionId are required" });
    }

    const baseMessages = [
      {
        role: "system",
        content: `You are a smart personal assistant.
                    If you know the answer to a question, answer it directly in plain English.
                    If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.
                    You have access to the following tool:
                    webSearch(query: string): Use this to search the internet for current or unknown information.
                    Decide when to use your own knowledge and when to use the tool.
                    Do not mention the tool unless needed.

                    Examples:
                    Q: What is the capital of France?
                    A: The capital of France is Paris.

                    Q: What’s the weather in Mumbai right now?
                    A: (use the search tool to find the latest weather)

                    Q: Who is the Prime Minister of India?
                    A: The current Prime Minister of India is Narendra Modi.

                    Q: Tell me the latest IT news.
                    A: (use the search tool to get the latest news)

                    current date and time: ${new Date().toUTCString()}`,
      },
    ];

    // Check if there's a cached conversation for this session
    // If there is, use it as the starting point for the conversation. Otherwise, start with the base messages.
    const messages = cache.get(sessionId) ?? baseMessages;

    messages.push({
      role: "user",
      content: prompt,
    });

    const MAX_RETRIES = 10;
    let count = 0;

    while (true) {
      if (count > MAX_RETRIES) {
        return res.status(500).json({ error: "Max retries exceeded." }); // ✅
      }
      count++;

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
        cache.set(sessionId, messages); // Cache the conversation for this session
        return res.json({
          response: completion.choices[0].message.content,
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
  } catch (error) {
    console.log("chat error", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

export default router;
