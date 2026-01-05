import { ModelData } from "@/types";

export interface AIService {
    generateContent(userContent: string): Promise<string>;
    getModels?(): Promise<ModelData[]>;
}
