import { useState, useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AIProviderSettings } from '@/components/settings/ai-provider-settings';
import { AIConfig } from '@/types';
import Icon from '@/assets/icon.svg';
import { Settings, Zap, Moon, Sun } from "lucide-react";

function App() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load config and theme
    Promise.all([
      // @ts-ignore
      storage.getItem('local:aiConfig'),
      // @ts-ignore
      storage.getItem('local:theme')
    ]).then(([aiData, themeData]: [any, any]) => {
      if (aiData) {
        setConfig(aiData);
      }

      const initialTheme = themeData || 'light';
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setLoading(false);
    });
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // @ts-ignore
    await storage.setItem('local:theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async (newConfig: AIConfig) => {
    // @ts-ignore
    await storage.setItem('local:aiConfig', newConfig);
    if (newConfig.provider === 'google') {
      // @ts-ignore
      await storage.setItem('local:apiKey', newConfig.apiKey);
    }
    setConfig(newConfig);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-8 h-8 animate-pulse text-primary" />
          <span className="text-sm font-medium tracking-widest text-primary/70 uppercase">Loading Settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <img src={Icon} alt="Logo" className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Replai <span className="text-primary text-xs ml-1 opacity-70">Settings</span></span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-muted/5 p-6 md:p-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

          <div className="flex flex-col gap-1.5 px-2">
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">AI Configuration</h1>
            <p className="text-muted-foreground text-sm font-medium">Connect and customize your AI models for a better experience.</p>
          </div>

          <Card className="shadow-2xl border-border/60 overflow-hidden ring-1 ring-primary/5">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-6 px-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Settings className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-bold tracking-tight">Provider Integration</CardTitle>
              </div>
              <CardDescription className="text-xs">Setup Gemini or OpenAI for content generation.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <AIProviderSettings initialConfig={config || undefined} onSave={handleSave} />
            </CardContent>
          </Card>

          <div className="px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
            <div>
              <h4 className="text-sm font-bold tracking-tight">Need help?</h4>
              <p className="text-xs text-muted-foreground">Check our documentation for API key instructions.</p>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-muted-foreground/40 tracking-[0.2em] uppercase pt-4">Replai Assistant Alpha • 2026</p>
        </div>
      </main>
    </div>
  );
}

export default App;
