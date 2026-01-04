import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Copy } from "lucide-react";

interface AiReplyDialogProps {
    initialContext?: string;
    onInsert?: (text: string) => void;
    trigger?: React.ReactNode;
}

export function AiReplyDialog({ initialContext, onInsert, trigger }: AiReplyDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setError("");
        setResult("");

        try {
            const response = await browser.runtime.sendMessage({
                type: "GENERATE_REQUEST",
                payload: { prompt, context: initialContext }
            });

            if (response && response.type === "GENERATE_SUCCESS") {
                setResult(response.payload.text);
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

    const handleInsert = () => {
        if (onInsert && result) {
            onInsert(result);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon" className="shadow-lg rounded-full h-8 w-8 p-0 bg-background hover:bg-muted">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>AI Reply</DialogTitle>
                    <DialogDescription>
                        Generate a reply using Gemini.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g., Agree politiely..."
                        disabled={loading}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {result && (
                        <div className="p-3 bg-muted rounded-md text-sm border border-border mt-2 whitespace-pre-wrap">
                            {result}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {result ? (
                        <>
                            <Button variant="ghost" onClick={() => setResult("")}>Clear</Button>
                            <Button onClick={handleInsert}>Insert</Button>
                        </>
                    ) : (
                        <Button onClick={handleGenerate} disabled={loading || !prompt}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
