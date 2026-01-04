import { GeminiService } from "@/lib/gemini";
import { ExtensionMessage, GenerateRequestPayload, TaskType } from "@/types";

const PROMPTS: Record<TaskType, (payload: GenerateRequestPayload) => string> = {
  reply: (payload) => `
        You are a social media assistant. 
        User Context (Post/Comment): """${payload.context}"""
        Specific Instruction: ${payload.userInput || "Write a natural reply"}

        Strict Guidelines:
        - Generate a strictly concise, single-paragraph response. 
        - DO NOT use Markdown lists (1., 2., -, *). 
        - DO NOT use multiple paragraphs. 
        - Keep it as a single block of text. No fluff, no introductory filler.
    `,
  summary: (payload) => `
        Summarize the main points of this post in Vietnamese.
        User Context: """${payload.context}"""

        Strict Guidelines:
        - Generate a strictly concise, single-paragraph summary. 
        - DO NOT use Markdown lists. 
        - DO NOT use multiple paragraphs. 
        - Focus on the core message.
    `,
  translate: (payload) => `
        You are a professional social media translator. 
        Target Language: ${payload.targetLang || "Vietnamese"}
        User Context: """${payload.context}"""
        
        Strict Guidelines:
        1. Preserve the original tone, intent, and cultural nuances.
        2. Maintain the linguistic structure appropriate for social media (informal but natural).
        3. Contextual Translation: DO NOT translate technical terms, brand names, or slang that would lose meaning or sound unnatural in the target language. If a term is widely used in its original form within the target community, keep it.
        4. If a word is untranslatable or its translation would be misleading, keep the original word in quotes or brackets.
        5. Ensure the final output feels like it was written by a native speaker.
        6. Return ONLY the translated text. No lists, no explanations. Single block of text.
    `
};

export default defineBackground(() => {
  console.log("Replai Background Service Initialized");

  browser.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    console.log("Background received message:", message.type, message);

    if (message.type === "GENERATE_REQUEST") {
      const payload = message.payload as GenerateRequestPayload;

      (async () => {
        try {
          const apiKey = await storage.getItem<string>("local:apiKey");

          if (!apiKey) {
            sendResponse({
              type: "GENERATE_ERROR",
              payload: { error: "NO_API_KEY", message: "API Key not found. Please set it in settings." }
            });
            return;
          }

          const promptGenerator = PROMPTS[payload.taskId];
          if (!promptGenerator) {
            sendResponse({
              type: "GENERATE_ERROR",
              payload: { error: "INVALID_TASK", message: "Unknown task type" }
            });
            return;
          }

          const systemPrompt = promptGenerator(payload);
          const gemini = new GeminiService(apiKey);

          // We treat context as part of the user content in GeminiService.generateContent
          const result = await gemini.generateContent(systemPrompt, payload.context);

          sendResponse({ type: "GENERATE_SUCCESS", payload: { text: result } });
        } catch (error: any) {
          console.error("Background Generation Error:", error);
          sendResponse({
            type: "GENERATE_ERROR",
            payload: { error: "API_ERROR", message: error.message }
          });
        }
      })();

      return true;
    }

    if (message.type === "PING") {
      sendResponse({ type: "PONG" });
      return false;
    }

    return false;
  });
});
