import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // 1. Load browser voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();

        // Chrome needs this event to load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // 2. Speak function
    const speak = useCallback((text: string, langCode = 'vi-VN') => {
        if (!text) return;

        // If speaking, stop (toggle behavior)
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            if (isSpeaking) {
                setIsSpeaking(false);
                return;
            }
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Find appropriate voice
        // Prioritize Google or Microsoft names for better quality
        const voice = voices.find(
            (v) => v.lang === langCode && (v.name.includes("Google") || v.name.includes("Vietnam"))
        ) || voices.find((v) => v.lang === langCode);

        if (voice) utterance.voice = voice;
        else {
            // Fallback: try finding any voice starting with the language code (e.g., 'vi')
            const fallbackVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
            if (fallbackVoice) utterance.voice = fallbackVoice;
        }


        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }, [voices, isSpeaking]);

    // 3. Emergency stop
    const stop = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { speak, stop, isSpeaking, voices };
};
