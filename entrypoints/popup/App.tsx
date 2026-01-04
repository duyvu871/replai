import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserConfig } from '@/types';

import Icon from '@/assets/icon.svg';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // @ts-ignore: WXT auto-import or global
    storage.getItem('local:apiKey').then((key: any) => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleSave = async () => {
    try {
      // @ts-ignore
      await storage.setItem('local:apiKey', apiKey);
      setStatus('Saved successfully!');
      setTimeout(() => setStatus(''), 2000);
    } catch (e) {
      setStatus('Failed to save.');
    }
  };

  return (
    <div className="w-[350px] p-2 bg-background">
      <Card className="border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
          <img src={Icon} alt="Logo" className="w-10 h-10" />
          <div>
            <CardTitle className="text-lg">Replai Assistant</CardTitle>
            <CardDescription className="text-xs">Configure your AI assistant</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          {status && <p className="text-sm text-green-600">{status}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full">Save Config</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
