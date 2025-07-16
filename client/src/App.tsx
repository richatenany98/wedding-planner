import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import GuestList from "@/pages/guest-list";
import TaskBoard from "@/pages/task-board";
import Budget from "@/pages/budget";
import Vendors from "@/pages/vendors";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import { User, WeddingProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

function Router({ weddingProfile }: { weddingProfile: WeddingProfile }) {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard weddingProfile={weddingProfile} />} />
      <Route path="/guests" component={GuestList} />
      <Route path="/tasks" component={TaskBoard} />
      <Route path="/budget" component={Budget} />
      <Route path="/vendors" component={Vendors} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [weddingProfile, setWeddingProfile] = useState<WeddingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('weddingProfile');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedProfile) {
      setWeddingProfile(JSON.parse(savedProfile));
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Check if user has a wedding profile
    if (userData.weddingProfileId) {
      try {
        const response = await apiRequest('GET', `/api/wedding-profile/${userData.weddingProfileId}`);
        const profile = await response.json();
        setWeddingProfile(profile);
        localStorage.setItem('weddingProfile', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to fetch wedding profile:', error);
      }
    }
  };

  const handleOnboardingComplete = async (profile: WeddingProfile) => {
    setWeddingProfile(profile);
    localStorage.setItem('weddingProfile', JSON.stringify(profile));
    
    // Update user with wedding profile ID
    if (user) {
      const updatedUser = { ...user, weddingProfileId: profile.id };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    // Update user with wedding profile ID
    if (user) {
      const updatedUser = { ...user, weddingProfileId: profile.id };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setWeddingProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('weddingProfile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : !weddingProfile ? (
          <Onboarding user={user} onComplete={handleOnboardingComplete} />
        ) : (
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar weddingProfile={weddingProfile} onLogout={handleLogout} />
            <main className="flex-1 overflow-hidden">
              <Router weddingProfile={weddingProfile} />
            </main>
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
