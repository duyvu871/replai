import { useState } from "react";

import { TaskType } from "@/types";

interface UseGeminiResult {
    loading: boolean;
    result: string;
    error: string;
    generate: (taskId: TaskType, context: string, options?: { userInput?: string, targetLang?: string }) => Promise<string | null>;
    setResult: (result: string) => void;
}

export function useGemini(): UseGeminiResult {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    const generate = async (taskId: TaskType, context: string, options?: { userInput?: string, targetLang?: string }): Promise<string | null> => {
        setLoading(true);
        setError("");
        setResult("");

        try {
            const response = await browser.runtime.sendMessage({
                type: "GENERATE_REQUEST",
                payload: {
                    taskId,
                    context,
                    userInput: options?.userInput,
                    targetLang: options?.targetLang
                }
            });

            if (response && response.type === "GENERATE_SUCCESS") {
                const text = response.payload.text;
                setResult(text);
                return text;
            } else if (response && response.type === "GENERATE_ERROR") {
                setError(response.payload.message || "Unknown error");
            } else {
                setError("Failed to get response");
            }
        } catch (e: any) {
            setError(e.message || "Communication failed");
        } finally {
            setLoading(false);
        }
        return null;
    };

    return { loading, result, error, generate, setResult };
}
