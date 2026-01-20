import AutomationCanvas from '@/components/automation/AutomationCanvas';

export default function AutomationPage() {
  return (
    <main className="h-screen w-full flex flex-col">
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 bg-white dark:bg-[#121212]">
        <h1 className="text-lg font-semibold">New Automation Flow</h1>
      </div>
      <div className="flex-1">
        <AutomationCanvas />
      </div>
    </main>
  );
}
