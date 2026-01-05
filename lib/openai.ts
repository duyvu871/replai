import OpenAI from "openai";
import { AIService } from "./ai-service.interface";
import { ModelData } from "@/types";

export class OpenAIService implements AIService {
    private client: OpenAI;
    private model: string;
    private systemPrompt: string;
    private baseUrl: string;

    constructor(apiKey: string, model: string, systemPrompt: string, baseUrl: string = "https://api.openai.com/v1") {
        this.model = model;
        this.systemPrompt = systemPrompt;
        this.baseUrl = baseUrl.replace(/\/+$/, "");

        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: this.baseUrl,
            dangerouslyAllowBrowser: true
        });
    }

    async generateContent(userContent: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: userContent }
                ]
            });

            return response.choices[0]?.message?.content || "";
        } catch (error: any) {
            console.error("OpenAI Generation Error:", error);
            throw error;
        }
    }

    async getModels(): Promise<ModelData[]> {
        try {
            // Special handling for OpenRouter for rich metadata
            if (this.baseUrl.includes("openrouter.ai")) {
                const response = await fetch("https://openrouter.ai/api/v1/models");
                const json = await response.json();
                return (json.data || []).map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    description: m.description,
                    context_length: m.context_length,
                    pricing: m.pricing,
                    top_provider: m.top_provider,
                    architecture: m.architecture
                }));
            }

            const list = await this.client.models.list();
            return list.data.map((model: any) => ({
                id: model.id,
                name: model.id, // Fallback name
                top_provider: { name: model.owned_by }
            })).sort((a, b) => a.id.localeCompare(b.id));
        } catch (error: any) {
            console.error("OpenAI Fetch Models Error:", error);
            throw error;
        }
    }
}
