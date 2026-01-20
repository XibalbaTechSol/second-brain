import AutomationCanvas from '@/components/automation/AutomationCanvas';

export default function AutomationPage() {
  return (
    <main className="h-screen w-full flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-6 bg-background">
        <h1 className="text-lg font-semibold text-foreground">New Automation Flow</h1>
      </div>
      <div className="flex-1">
        <AutomationCanvas />
      </div>
    </main>
  );
}
