import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIService } from "./ai-service.interface";
import { ModelData } from "@/types";

export class GeminiService implements AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private systemPrompt: string;

    constructor(apiKey: string, modelName: string = "gemini-1.5-flash", systemPrompt: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.systemPrompt = systemPrompt;
    }

    async generateContent(userContent: string): Promise<string> {
        try {
            const result = await this.model.generateContent([
                { text: this.systemPrompt },
                { text: userContent }
            ]);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error("Gemini Generation Error:", error);
            throw new Error(error.message || "Failed to generate content");
        }
    }

    async getModels(): Promise<ModelData[]> {
        return [
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast and versatile performance for a variety of tasks", context_length: 1048576, top_provider: { name: "Google" } },
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Complex reasoning and extremely large context windows", context_length: 2097152, top_provider: { name: "Google" } },
            { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Exp)", description: "Next-gen experimental model with low latency", context_length: 1048576, top_provider: { name: "Google" } },
        ];
    }
}
