
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { AIConfig, ModelData } from "@/types";

interface AIProviderSettingsProps {
    onSave: (config: AIConfig) => void;
    initialConfig?: AIConfig;
}

export function AIProviderSettings({ onSave, initialConfig }: AIProviderSettingsProps) {
    const [provider, setProvider] = useState<"google" | "openai">(initialConfig?.provider || "google");
    const [apiKey, setApiKey] = useState(initialConfig?.apiKey || "");
    const [baseUrl, setBaseUrl] = useState(initialConfig?.baseUrl || "");
    const [model, setModel] = useState(initialConfig?.model || "");
    const [models, setModels] = useState<ModelData[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [status, setStatus] = useState("");
    const [open, setOpen] = useState(false);

    // Effect to auto-fetch models when provider/key/url changes
    useEffect(() => {
        if (!apiKey) return;

        // Debounce or just check valid length?
        // simple toggle to avoid rapid fire
        const timer = setTimeout(() => {
            fetchModels();
        }, 800);

        return () => clearTimeout(timer);
    }, [provider, apiKey, baseUrl]);

    // Load cache on mount? handled by fetchModels likely caching?
    // User requested "fetched first time then auto stored corresponding to apikey"
    // We can use a local mapping state or just rely on the API call which is cheap enough for now
    // or implement a simple cache here.

    const fetchModels = async () => {
        if (!apiKey) return;
        setLoadingModels(true);
        setStatus("");

        try {
            const response = await browser.runtime.sendMessage({
                type: "FETCH_MODELS",
                payload: { provider, apiKey, baseUrl }
            });

            console.log("response", response);
            if (response && response.type === "GENERATE_SUCCESS") {
                setModels(response.payload.models || []);
                // Auto-select first if current model is invalid?
                // if (!response.payload.models.includes(model)) {
                //    setModel(response.payload.models[0] || "");
                // } 
            } else {
                setModels([]);
                // setStatus("Failed to fetch models");
            }
        } catch (e) {
            console.error(e);
            setModels([]);
        } finally {
            setLoadingModels(false);
        }
    };

    const handleSave = () => {
        if (!apiKey || !model) {
            setStatus("Please fill in all fields");
            return;
        }
        onSave({ provider, apiKey, baseUrl, model });
        setStatus("Saved!");
        setTimeout(() => setStatus(""), 2000);
    };

    return (

        <div className="space-y-4">
            <div className="space-y-2">
                <Label>AI Provider</Label>
                <Select
                    value={provider}
                    onValueChange={(val) => { setProvider(val as "google" | "openai"); setModel(""); }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="google">Google Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === "google" ? "Gemini API Key" : "OpenAI API Key"}
                />
            </div>

            {provider === "openai" && (
                <div className="space-y-2">
                    <Label>Base URL (Optional)</Label>
                    <Input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://api.openai.com/v1"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>Model</Label>
                <div className="relative">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between font-normal h-auto py-2"
                                disabled={loadingModels || models.length === 0}
                            >
                                <span className="truncate">
                                    {model
                                        ? models.find((m) => m.id === model)?.name || model
                                        : loadingModels ? "Loading models..." : "Select Model..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search model..." />
                                <CommandList>
                                    <CommandEmpty>No model found.</CommandEmpty>
                                    <CommandGroup>
                                        {models.map((m) => (
                                            <CommandItem
                                                key={m.id}
                                                value={m.id}
                                                onSelect={(currentValue) => {
                                                    setModel(currentValue);
                                                    setOpen(false);
                                                }}
                                                className="flex flex-col items-start gap-1 p-3 cursor-pointer max-w-[500px] break-after-all"
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span className="font-bold text-sm tracking-tight">{m.name || m.id}</span>
                                                    {m.id === model && <Check className="h-4 w-4 text-primary shrink-0" />}
                                                </div>

                                                {m.description && (
                                                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {m.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                    {m.top_provider?.name && (
                                                        <span className="text-[10px] font-medium text-muted-foreground/60 border-b border-muted-foreground/20 italic">by {m.top_provider.name}</span>
                                                    )}
                                                    {m.context_length && (
                                                        <span className="text-[10px] font-semibold text-muted-foreground/80">{Math.round(m.context_length / 1024)}K context</span>
                                                    )}
                                                    {m.pricing && (
                                                        <span className="text-[10px] font-bold text-green-600/70 dark:text-green-400/70 uppercase tracking-tighter">
                                                            {m.pricing.prompt === "0" ? "FREE" : `$${(parseFloat(m.pricing.prompt) * 1000000).toFixed(2)} / M`}
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
                    {loadingModels && (
                        <div className="absolute right-10 top-2.5 z-10">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
                {models.length === 0 && !loadingModels && apiKey && (
                    <p className="text-[10px] text-muted-foreground">Type a valid API Key to load models.</p>
                )}
            </div>

            {status && <p className="text-sm text-primary font-medium">{status}</p>}

            <Button onClick={handleSave} className="w-full mt-4" disabled={loadingModels}>
                Save Configuration
            </Button>
        </div>
    );

}
