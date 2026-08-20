import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import { DynamicBackground } from "@/components/DynamicBackground";
import { useState } from "react";

function Router({ parsedData, onUpload }: { parsedData: any; onUpload: (data: any) => void }) {
  return (
    <Switch>
      <Route path="/">
        {parsedData ? (
          <Dashboard parsedData={parsedData} />
        ) : (
          <Home onUpload={onUpload} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [parsedData, setParsedData] = useState<any>(null);

  return (
    <WouterRouter base="/snapdata">
      <TooltipProvider>
        <DynamicBackground />
        <div className="relative z-10 min-h-screen">
          <Router parsedData={parsedData} onUpload={(data) => setParsedData(data)} />
        </div>
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
