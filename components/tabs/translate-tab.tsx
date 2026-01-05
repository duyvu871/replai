import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRightLeft, Copy, Check, Sparkles, Languages, ChevronDown } from "lucide-react";
import { useGemini } from "@/hooks/use-gemini";
import { cn } from "@/lib/utils";
import { usePost } from "../post-context";
import { Skeleton } from "../ui/skeleton";
import { Typewriter } from "../typewriter";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Volume2, StopCircle } from "lucide-react";

interface TranslateTabProps {
    onInsert: (text: string) => void;
}

const LANGUAGES = [
    { label: "Vietnamese", value: "Vietnamese" },
    { label: "English", value: "English" },
    { label: "Japanese", value: "Japanese" },
    { label: "Korean", value: "Korean" },
    { label: "Chinese", value: "Chinese" },
    { label: "French", value: "French" },
];

export function TranslateTab({ onInsert }: TranslateTabProps) {
    const { postText, getPostText, isLoading: textLoading, responses, setResponse } = usePost();
    const { loading: geminiLoading, result: geminiResult, error, generate, setResult } = useGemini();
    const [copied, setCopied] = useState(false);
    const [targetLang, setTargetLang] = useState("Vietnamese");
    const [showLangs, setShowLangs] = useState(false);
    const [finished, setFinished] = useState(false);
    const { speak, stop, isSpeaking } = useTextToSpeech();

    const result = responses.translate || geminiResult;

    const handleTranslate = async () => {
        // Clear previous cache if we are translating to a new language or no cache exists
        // Actually, let's keep it simple: if there's a result and it's for the same language, do nothing
        // But we don't store language in cache yet. Let's just re-generate if the user explicitly clicks.

        const text = await getPostText();
        setFinished(false);

        const responseText = await generate("translate", text, { targetLang });
        if (responseText) {
            setResponse('translate', responseText);
        }
    };

    const handleDiscard = () => {
        setResponse('translate', '');
        setResult("");
        setFinished(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const selectLanguage = (lang: string) => {
        setTargetLang(lang);
        setShowLangs(false);
        // Clear old translate result when language changes to avoid confusion
        handleDiscard();
    };

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
                {/* Language Selector */}
                <div className="relative">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-foreground/60">Source</span>
                            <ArrowRightLeft className="w-3 h-3 text-muted-foreground/40" />
                            <button
                                onClick={() => setShowLangs(!showLangs)}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:bg-primary/5 px-2 py-0.5 rounded-md transition-colors"
                            >
                                {targetLang}
                                <ChevronDown className={cn("w-3 h-3 transition-transform", showLangs && "rotate-180")} />
                            </button>
                        </div>
                    </div>

                    {showLangs && (
                        <div className="absolute top-full left-[60px] mt-1 w-32 bg-popover border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-1 max-h-[160px] overflow-y-auto">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => selectLanguage(lang.value)}
                                        className={cn(
                                            "w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted transition-colors",
                                            targetLang === lang.value ? "text-primary font-bold bg-primary/5" : "text-foreground/70"
                                        )}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-2">
                    <div className="relative group">
                        <div className="absolute top-1.5 right-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">Original</div>
                        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] text-muted-foreground leading-relaxed italic shadow-inner max-h-[100px] overflow-y-auto">
                            {postText || "No content..."}
                        </div>
                    </div>

                    <div className="relative min-h-[100px] group transition-all">
                        <div className="absolute top-1.5 right-2 flex items-center gap-2 z-10 transition-colors">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary/30 group-hover:text-primary/50">Translation</span>
                            {result && (
                                <button
                                    onClick={() => isSpeaking ? stop() : speak(result, targetLang === "Vietnamese" ? "vi-VN" : targetLang === "English" ? "en-US" : targetLang === "Japanese" ? "ja-JP" : targetLang === "Korean" ? "ko-KR" : targetLang === "Chinese" ? "zh-CN" : targetLang === "French" ? "fr-FR" : "vi-VN")}
                                    className={cn(
                                        "p-1 rounded-full hover:bg-primary/10 transition-all",
                                        isSpeaking ? "text-primary animate-pulse bg-primary/10" : "text-primary/40 hover:text-primary"
                                    )}
                                    title={isSpeaking ? "Stop speaking" : "Read aloud"}
                                >
                                    {isSpeaking ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                            )}
                        </div>

                        <div className={cn(
                            "h-full p-3 rounded-xl border transition-all duration-300",
                            result ? "bg-primary/2 border-primary/20 shadow-sm" : "bg-muted/10 border-dashed border-border/50"
                        )}>
                            {geminiLoading || textLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-[90%]" />
                                    <Skeleton className="h-3 w-[85%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                            ) : null}

                            {error ? (
                                <div className="text-[11px] text-destructive flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-destructive" />
                                    {error}
                                </div>
                            ) : result ? (
                                <div className="text-[12px] text-foreground leading-relaxed">
                                    <Typewriter
                                        text={result}
                                        speed={5}
                                        animate={!finished}
                                        onComplete={() => setFinished(true)}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-2 opacity-30">
                                    <Languages className="w-8 h-8 mb-1 text-muted-foreground" />
                                    <p className="text-[10px] text-muted-foreground">Ready</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-1">
                {!result || geminiLoading || textLoading ? (
                    <Button
                        onClick={handleTranslate}
                        disabled={geminiLoading || textLoading}
                        className="w-full h-9 rounded-xl shadow-sm text-[11px] font-medium"
                    >
                        {geminiLoading || textLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {textLoading ? "Reading..." : geminiLoading ? "Translating..." : `Translate to ${targetLang}`}
                    </Button>
                ) : (
                    <div className="flex items-center justify-between w-full gap-2 animate-in fade-in zoom-in-95">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-xl border-border/50 hover:bg-muted"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="ghost"
                                onClick={handleDiscard}
                                className="flex-1 h-9 rounded-xl text-muted-foreground text-[11px]"
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={() => onInsert(result)}
                                className="flex-2 h-9 rounded-xl shadow-sm font-medium text-[11px]"
                            >
                                Insert
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
