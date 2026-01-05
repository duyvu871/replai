import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, MessageSquare, Languages, FileText, ArrowRightLeft, Copy, Check, ChevronsUpDown } from "lucide-react";
import { TranslateTab } from "./tabs/translate-tab";
import { PostProvider, usePost } from "./post-context";
import { Skeleton } from "./ui/skeleton";
import { Typewriter } from "./typewriter";
import { AIConfig, ModelData } from "@/types";
import { cn } from "@/lib/utils";
import Icon from '@/assets/icon.svg';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

interface PostTriggerProps {
    onInsert: (text: string) => void;
    onGetText?: () => Promise<string>;
}

export function PostTrigger({ onInsert, onGetText }: PostTriggerProps) {
    return (
        <PostProvider onGetText={onGetText}>
            <PostTriggerInner onInsert={onInsert} onGetText={onGetText} />
        </PostProvider>
    );
}

function PostTriggerInner({ onInsert, onGetText }: PostTriggerProps) {
    const [open, setOpen] = useState(false);
    const { getPostText, isLoading: textLoading, responses, setResponse } = usePost();

    // Reply State
    const [replyPrompt, setReplyPrompt] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyCopied, setReplyCopied] = useState(false);

    // Summary State
    const [summaryPrompt, setSummaryPrompt] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryCopied, setSummaryCopied] = useState(false);

    const [error, setError] = useState("");

    // Model Selection State
    const [config, setConfig] = useState<AIConfig | null>(null);
    const [models, setModels] = useState<ModelData[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelOpen, setModelOpen] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        // @ts-ignore
        const currentConfig = await storage.getItem<AIConfig>("local:aiConfig");
        if (currentConfig) {
            setConfig(currentConfig);
            if (currentConfig.apiKey) {
                fetchModels(currentConfig);
            }
        }
    };

    const fetchModels = async (cfg: AIConfig) => {
        setLoadingModels(true);
        try {
            const response = await browser.runtime.sendMessage({
                type: "FETCH_MODELS",
                payload: {
                    provider: cfg.provider,
                    apiKey: cfg.apiKey,
                    baseUrl: cfg.baseUrl
                }
            });
            if (response && response.type === "GENERATE_SUCCESS") {
                setModels(response.payload.models || []);
            }
        } catch (e) {
            console.error("Content script model fetch failed", e);
        } finally {
            setLoadingModels(false);
        }
    };

    const handleModelChange = async (newModelId: string) => {
        if (!config) return;
        const newConfig = { ...config, model: newModelId };
        setConfig(newConfig);
        // @ts-ignore
        await storage.setItem("local:aiConfig", newConfig);
        setModelOpen(false);
    };

    const detectLanguage = () => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz.includes('Ho_Chi_Minh') || tz.includes('Saigon')) return 'Vietnamese';
            if (tz.includes('Tokyo') || tz.includes('Osaka')) return 'Japanese';
            if (tz.includes('Paris') || tz.includes('Brussels')) return 'French';
            if (tz.includes('Seoul')) return 'Korean';
            if (tz.includes('Shanghai') || tz.includes('Beijing') || tz.includes('Hong_Kong') || tz.includes('Taipei')) return 'Chinese';

            const locale = Intl.DateTimeFormat().resolvedOptions().locale;
            if (locale.startsWith('vi')) return 'Vietnamese';
            if (locale.startsWith('en')) return 'English';
            if (locale.startsWith('ja')) return 'Japanese';
            if (locale.startsWith('zh')) return 'Chinese';
            if (locale.startsWith('fr')) return 'French';
            if (locale.startsWith('ko')) return 'Korean';
        } catch (e) {
            console.error("Language detection failed", e);
        }
        return 'Vietnamese';
    };

    const handleGenerate = async (
        type: "reply" | "translate" | "summary",
        setLoading: (l: boolean) => void,
        customPrompt?: string
    ) => {
        if (responses[type]) return;

        setLoading(true);
        setError("");

        let context = "";

        try {
            context = await getPostText();
        } catch (e) {
            console.error("Failed to get post text", e);
        }

        try {
            const response = await browser.runtime.sendMessage({
                type: "GENERATE_REQUEST",
                payload: {
                    taskId: type,
                    context,
                    userInput: customPrompt,
                    targetLang: detectLanguage()
                }
            });

            if (response && response.type === "GENERATE_SUCCESS") {
                setResponse(type, response.payload.text);
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
    };


    const handleInsert = (text: string) => {
        onInsert(text);
        setOpen(false);
    }

    const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary text-primary rounded-full transition-all duration-300 group">
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[440px] p-0 rounded-2xl overflow-hidden border-border/50 bg-background backdrop-blur-xl shadow-2xl" align="end" sideOffset={8}>
                <Tabs defaultValue="reply" className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-3 pb-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1">
                                <img src={Icon} alt="Replai Logo" className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold text-sm tracking-tight text-foreground">Assistant</h4>
                        </div>

                        {config && (
                            <Popover open={modelOpen} onOpenChange={setModelOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 flex items-center gap-1.5 hover:bg-muted text-[10px] font-bold text-muted-foreground transition-all rounded-lg max-w-[180px]"
                                    >
                                        <span className="truncate">{models.find(m => m.id === config.model)?.name || config.model}</span>
                                        <ChevronsUpDown className="w-3 h-3 opacity-50 shrink-0" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 rounded-xl overflow-hidden border-border/50 shadow-xl" align="end" sideOffset={5}>
                                    <Command>
                                        <CommandInput placeholder="Search models..." className="h-9 text-xs" />
                                        <CommandList>
                                            <CommandEmpty>No model found.</CommandEmpty>
                                            <CommandGroup className="max-h-[250px] overflow-y-auto">
                                                {models.map((m) => (
                                                    <CommandItem
                                                        key={m.id}
                                                        value={m.id}
                                                        onSelect={handleModelChange}
                                                        className="flex flex-col items-start gap-0.5 p-2 px-3 cursor-pointer"
                                                    >
                                                        <div className="flex w-full items-center justify-between">
                                                            <span className="font-bold text-[11px] tracking-tight truncate max-w-[200px]">
                                                                {m.name || m.id}
                                                            </span>
                                                            {m.id === config.model && <Check className="h-3 w-3 text-primary shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {m.context_length && (
                                                                <span className="text-[9px] font-semibold text-muted-foreground/60">
                                                                    {Math.round(m.context_length / 1024)}K ctx
                                                                </span>
                                                            )}
                                                            {m.pricing && (
                                                                <span className="text-[9px] font-black text-green-600/60 dark:text-green-400/60">
                                                                    {m.pricing.prompt === "0" ? "FREE" : `$${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)}/M`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>

                    <TabsList className="flex h-11 bg-muted/30 border-b border-border/50 gap-1 p-1 justify-around items-center">
                        <TabsTrigger value="reply" className="flex-1 h-8 gap-1.5 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-sm rounded-lg transition-all font-semibold text-[11px]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Reply
                        </TabsTrigger>
                        <TabsTrigger value="translate" className="flex-1 h-8 gap-1.5 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-sm rounded-lg transition-all font-semibold text-[11px]">
                            <Languages className="w-3.5 h-3.5" />
                            Translate
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="flex-1 h-8 gap-1.5 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground! data-[state=active]:shadow-sm rounded-lg transition-all font-semibold text-[11px]">
                            <FileText className="w-3.5 h-3.5" />
                            Summary
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 p-3 min-h-[200px]">
                        {error && <p className="text-[10px] text-destructive font-medium bg-destructive/10 px-2 py-1 rounded-full mb-2">{error}</p>}

                        {/* Reply Tab */}
                        <TabsContent value="reply" className="mt-0 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="relative group">
                                <Input
                                    placeholder="Enter instructions..."
                                    value={replyPrompt}
                                    onChange={(e) => setReplyPrompt(e.target.value)}
                                    className="h-10 pl-3 pr-10 text-xs bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
                                />
                                <Button
                                    size="icon"
                                    onClick={() => handleGenerate("reply", setReplyLoading, replyPrompt)}
                                    disabled={replyLoading}
                                    className="absolute right-1 top-1 h-8 w-8 rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95"
                                >
                                    {replyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />}
                                </Button>
                            </div>

                            {replyLoading && (
                                <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <Skeleton className="h-3 w-[90%]" />
                                    <Skeleton className="h-3 w-[85%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                            )}

                            {responses.reply && !replyLoading && (
                                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                    <div className="rounded-xl bg-muted/50 p-3 text-xs text-foreground/90 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed border border-border/50 shadow-inner">
                                        <Typewriter text={responses.reply} speed={5} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleCopy(responses.reply, setReplyCopied)}
                                            className="h-8 w-8 rounded-lg border-border/50"
                                        >
                                            {replyCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setResponse("reply", "")}
                                            className="h-8 px-3 rounded-lg text-muted-foreground hover:bg-muted text-[11px]"
                                        >
                                            Discard
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleInsert(responses.reply)}
                                            className="h-8 px-4 rounded-lg font-medium shadow-sm text-[11px]"
                                        >
                                            Insert Reply
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!responses.reply && !replyLoading && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {["Polite", "Funny", "Professional"].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setReplyPrompt(suggestion)}
                                            className="px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-[10px] text-muted-foreground transition-colors border border-border/50"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Translate Tab */}
                        <TabsContent value="translate" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TranslateTab onInsert={handleInsert} />
                        </TabsContent>

                        {/* Summary Tab */}
                        <TabsContent value="summary" className="mt-0 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {!responses.summary && (
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Input
                                            placeholder="Analysis focus (e.g. key takeaways, sentiment...)"
                                            value={summaryPrompt}
                                            onChange={(e) => setSummaryPrompt(e.target.value)}
                                            className="h-10 pl-3 pr-10 text-xs bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={() => handleGenerate("summary", setSummaryLoading, summaryPrompt)}
                                            disabled={summaryLoading}
                                            className="absolute right-1 top-1 h-8 w-8 rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95"
                                        >
                                            {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                        </Button>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-2 space-y-1">
                                        <p className="text-[10px] text-muted-foreground text-center px-6">
                                            Summarize and analyze based on detected language ({detectLanguage()}).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {summaryLoading && (
                                <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-[95%]" />
                                    <Skeleton className="h-3 w-[60%]" />
                                </div>
                            )}

                            {responses.summary && !summaryLoading && (
                                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                                    <div className="rounded-xl bg-muted/50 p-3 text-xs text-foreground/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed border border-border/50 shadow-inner">
                                        <Typewriter text={responses.summary} speed={5} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleCopy(responses.summary, setSummaryCopied)}
                                            className="h-8 w-8 rounded-lg border-border/50"
                                        >
                                            {summaryCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setResponse("summary", "")}
                                            className="h-8 px-3 rounded-lg text-muted-foreground text-[11px]"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
