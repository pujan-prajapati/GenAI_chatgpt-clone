import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export const webSearch = async ({ query }) => {
  console.log("tool calling...");
  const response = await tvly.search(query);
  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");
  return finalResult;
};
