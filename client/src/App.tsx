import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DynamicBackground />
        <div className="relative z-10 min-h-screen">
          <Router parsedData={parsedData} onUpload={(data) => setParsedData(data)} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
