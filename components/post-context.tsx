import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface PostContextType {
    postText: string;
    isLoading: boolean;
    error: string | null;
    getPostText: () => Promise<string>;
    clearCache: () => void;
    // AI Cache
    responses: {
        reply: string;
        translate: string;
        summary: string;
    };
    setResponse: (type: 'reply' | 'translate' | 'summary', text: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children, onGetText }: { children: React.ReactNode; onGetText?: () => Promise<string> }) {
    const [postText, setPostText] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [responses, setResponses] = useState({
        reply: "",
        translate: "",
        summary: ""
    });

    const setResponse = useCallback((type: 'reply' | 'translate' | 'summary', text: string) => {
        setResponses(prev => ({ ...prev, [type]: text }));
    }, []);

    const getPostText = useCallback(async () => {
        // If we already have the text, return it from cache
        if (postText) return postText;
        if (!onGetText) return "";

        setIsLoading(true);
        setError(null);
        try {
            const text = await onGetText();
            setPostText(text);
            return text;
        } catch (e: any) {
            setError(e.message || "Failed to fetch post content");
            return "";
        } finally {
            setIsLoading(false);
        }
    }, [onGetText, postText]);

    const clearCache = useCallback(() => {
        setPostText("");
    }, []);

    const value = useMemo(() => ({
        postText,
        isLoading,
        error,
        getPostText,
        clearCache,
        responses,
        setResponse
    }), [postText, isLoading, error, getPostText, clearCache, responses, setResponse]);

    return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePost() {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error("usePost must be used within a PostProvider");
    }
    return context;
}
