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
import Prescriptions from "@/pages/prescriptions";
import Analytics from "@/pages/analytics";
import Staff from "@/pages/staff";
import Settings from "@/pages/settings";
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
          <Route path="/prescriptions" component={Prescriptions} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/staff" component={Staff} />
          <Route path="/settings" component={Settings} />
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
