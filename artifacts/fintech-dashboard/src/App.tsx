import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

const queryClient = new QueryClient();
const AUTH_STORAGE_KEY = "nexora.authenticated";

const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Insights = lazy(() =>
  import("@/pages/Insights").then((module) => ({ default: module.Insights })),
);
const Transactions = lazy(() =>
  import("@/pages/Transactions").then((module) => ({
    default: module.Transactions,
  })),
);
const CreditScore = lazy(() =>
  import("@/pages/CreditScore").then((module) => ({
    default: module.CreditScore,
  })),
);
const Investment = lazy(() =>
  import("@/pages/Investment").then((module) => ({ default: module.Investment })),
);
const AIAssistant = lazy(() =>
  import("@/pages/AIAssistant").then((module) => ({
    default: module.AIAssistant,
  })),
);
const Goals = lazy(() =>
  import("@/pages/Goals").then((module) => ({
    default: module.Goals,
  })),
);
const Bills = lazy(() =>
  import("@/pages/Bills").then((module) => ({
    default: module.Bills,
  })),
);
const Notifications = lazy(() =>
  import("@/pages/Notifications").then((module) => ({
    default: module.Notifications,
  })),
);
const Recurring = lazy(() =>
  import("@/pages/Recurring").then((module) => ({ default: module.Recurring })),
);
const Settings = lazy(() =>
  import("@/pages/Settings").then((module) => ({ default: module.Settings })),
);
const Login = lazy(() =>
  import("@/pages/Login").then((module) => ({ default: module.Login })),
);
const NotFound = lazy(() => import("@/pages/not-found"));

function isAuthenticated() {
  return typeof window !== "undefined" && localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

function LoginEntry() {
  return isAuthenticated() ? <Redirect to="/dashboard" /> : <Login />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return isAuthenticated() ? <Component /> : <Redirect to="/login" />;
}

function Router() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-slate-400">
            Loading Nexora workspace...
          </div>
        }
      >
        <Switch>
          <Route path="/" component={LoginEntry} />
          <Route path="/login" component={LoginEntry} />
          <Route path="/dashboard">
            <ProtectedRoute component={Dashboard} />
          </Route>
          <Route path="/insights">
            <ProtectedRoute component={Insights} />
          </Route>
          <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
          <Route path="/bills" component={() => <ProtectedRoute component={Bills} />} />
          <Route path="/recurring" component={() => <ProtectedRoute component={Recurring} />} />
          <Route path="/credit-score" component={() => <ProtectedRoute component={CreditScore} />} />
          <Route path="/invest">
            <ProtectedRoute component={Investment} />
          </Route>
          <Route path="/goals">
            <ProtectedRoute component={Goals} />
          </Route>
          <Route path="/ai-assistant">
            <ProtectedRoute component={AIAssistant} />
          </Route>
          <Route path="/notifications">
            <ProtectedRoute component={Notifications} />
          </Route>
          <Route path="/settings">
            <ProtectedRoute component={Settings} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
