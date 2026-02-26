import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import { DynamicBackground } from "@/components/DynamicBackground";
import { useState } from "react";

function Router({ dataUploaded, onUpload }: { dataUploaded: boolean; onUpload: () => void }) {
  return (
    <Switch>
      <Route path="/">
        {dataUploaded ? (
          <Dashboard />
        ) : (
          <Home onUpload={onUpload} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [dataUploaded, setDataUploaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DynamicBackground />
        <div className="relative z-10 min-h-screen">
          <Router dataUploaded={dataUploaded} onUpload={() => setDataUploaded(true)} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
