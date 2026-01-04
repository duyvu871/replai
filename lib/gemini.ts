import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateContent(systemPrompt: string, userContent: string): Promise<string> {
        try {
            const result = await this.model.generateContent([
                { text: systemPrompt },
                { text: userContent }
            ]);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error("Gemini Generation Error:", error);
            throw new Error(error.message || "Failed to generate content");
        }
    }
}
