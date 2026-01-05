export interface AIConfig {
    provider: "google" | "openai";
    apiKey: string;
    baseUrl?: string;
    model: string;
}

export interface ModelData {
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    pricing?: {
        prompt: string;
        completion: string;
        request?: string;
    };
    top_provider?: {
        name: string;
    };
    architecture?: {
        tokenizer?: string;
        instruct_type?: string;
        modality?: string;
    };
}

export interface UserConfig {
    language: string;
    tone: string;
}
// ... existing code ...

export type MessageType = "GENERATE_REQUEST" | "GENERATE_SUCCESS" | "GENERATE_ERROR" | "PING" | "FETCH_MODELS";

export type TaskType = "reply" | "translate" | "summary";

export interface GenerateRequestPayload {
    taskId: TaskType;
    context: string;
    userInput?: string;     // For custom reply instructions
    targetLang?: string;    // For translation
}

export interface FetchModelsPayload {
    provider: "google" | "openai";
    apiKey: string;
    baseUrl?: string;
}

export interface GenerateSuccessPayload {
    text: string;
}

export interface GenerateErrorPayload {
    error: string;
    message: string;
}

export interface ExtensionMessage {
    type: MessageType;
    payload?: any;
}
