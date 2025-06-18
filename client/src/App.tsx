import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import Appointments from "@/pages/appointments";
import ClinicalNotes from "@/pages/clinical-notes";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/patients" component={Patients} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/clinical-notes" component={ClinicalNotes} />
          {/* Placeholder routes for future pages */}
          <Route path="/prescriptions" component={() => <div className="p-8 text-center"><h1 className="text-2xl font-semibold text-slate-900">Prescriptions</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
          <Route path="/analytics" component={() => <div className="p-8 text-center"><h1 className="text-2xl font-semibold text-slate-900">Analytics</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
          <Route path="/staff" component={() => <div className="p-8 text-center"><h1 className="text-2xl font-semibold text-slate-900">Staff Management</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
          <Route path="/settings" component={() => <div className="p-8 text-center"><h1 className="text-2xl font-semibold text-slate-900">Settings</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
          <Route path="/billing" component={() => <div className="p-8 text-center"><h1 className="text-2xl font-semibold text-slate-900">Billing</h1><p className="text-slate-600 mt-2">Coming soon...</p></div>} />
        </>
      )}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
