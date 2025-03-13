import OpenAI from "openai";

export default function getOpeAIClient(apiKey: string) {
  const openai = new OpenAI({
    apiKey, // : params.openai,
    dangerouslyAllowBrowser: true,
  });

  return openai;
}
