export interface UserConfig {
    apiKey: string;
    language: string;
    tone: string;
}

export type MessageType = "GENERATE_REQUEST" | "GENERATE_SUCCESS" | "GENERATE_ERROR" | "PING";

export type TaskType = "reply" | "translate" | "summary";

export interface GenerateRequestPayload {
    taskId: TaskType;
    context: string;
    userInput?: string;     // For custom reply instructions
    targetLang?: string;    // For translation
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
