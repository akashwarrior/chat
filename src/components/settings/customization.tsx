'use client'

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomizationProps {
  mainTextFont: string;
  codeFont: string;
  statsForNerds: boolean;
}

export function Customization({ mainTextFont, codeFont, statsForNerds }: CustomizationProps) {
  const setStatsForNerds = (checked: boolean) => {
    document.cookie = `statsForNerds=${checked}; path=/; max-age=31536000; samesite=strict`
  }

  const setMainTextFont = (value: string) => {
    document.cookie = `mainTextFont=${value}; path=/; max-age=31536000; samesite=strict`
    document.documentElement.setAttribute('data-main-font', value)
  }

  const setCodeFont = (value: string) => {
    document.cookie = `codeFont=${value}; path=/; max-age=31536000; samesite=strict`
    document.documentElement.setAttribute('data-code-font', value)
  }

  return (
    <div>
      <h2 className="text-xl lg:text-2xl font-semibold mb-6">Customize Chat</h2>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <Label htmlFor="stats-nerds">Stats for Nerds</Label>
            <p className="text-sm text-muted-foreground">
              Enables more insights into message stats including tokens per message and estimated tokens in the message.
            </p>
          </div>
          <Switch
            id="stats-nerds"
            defaultChecked={statsForNerds}
            onCheckedChange={(checked) => setStatsForNerds(checked)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="main-font">Main Text Font</Label>
            <p className="text-xs text-muted-foreground">
              Used in general text throughout the app.
            </p>
            <Select
              defaultValue={mainTextFont}
              onValueChange={(value) => setMainTextFont(value)}
            >
              <SelectTrigger id="main-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pixelify-sans">Pixelify Sans (default)</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
                <SelectItem value="arial">Arial</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code-font">Code Font</Label>
            <p className="text-xs text-muted-foreground">
              Used in code blocks and inline code in chat messages.
            </p>
            <Select
              defaultValue={codeFont}
              onValueChange={(value) => setCodeFont(value)}
            >
              <SelectTrigger id="code-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jetBrains-mono">JetBrains Mono (default)</SelectItem>
                <SelectItem value="fira-code">Fira Code</SelectItem>
                <SelectItem value="m-PLUS-1-Code">M PLUS 1 Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold mb-3">Fonts Preview</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Main text:</p>
              <p className="text-sm">Can you write me a simple hello world program?</p>
            </div>
            <code>
              <p className="text-sm text-muted-foreground mb-2">Code:</p>
              <div className="bg-card rounded p-3 font-mono text-sm overflow-x-auto">
                <div className="text-purple-400">function</div>
                <div className="text-blue-400">greet(name: string) {'{'}</div>
                <div className="ml-4">console.log(`Hello, ${'{'}name{'}'}!`);</div>
                <div className="ml-4">return true;</div>
                <div>{'}'}</div>
              </div>
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}