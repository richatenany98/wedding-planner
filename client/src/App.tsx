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
import EventLogistics from "@/pages/event-logistics";
import NotFound from "@/pages/not-found";
import { User, WeddingProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

function Router({ weddingProfile }: { weddingProfile: WeddingProfile }) {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard weddingProfile={weddingProfile} />} />
      <Route path="/guests" component={() => <GuestList weddingProfile={weddingProfile} />} />
      <Route path="/tasks" component={() => <TaskBoard weddingProfile={weddingProfile} />} />
      <Route path="/budget" component={() => <Budget weddingProfile={weddingProfile} />} />
      <Route path="/vendors" component={() => <Vendors weddingProfile={weddingProfile} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [weddingProfile, setWeddingProfile] = useState<WeddingProfile | null>(null);
  const [needsEventSetup, setNeedsEventSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('weddingProfile');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Only check for events if we have both user and profile
      if (savedProfile) {
        setWeddingProfile(JSON.parse(savedProfile));
        
        // Check if events exist for this profile
        const checkEvents = async () => {
          try {
            const profile = JSON.parse(savedProfile);
            const eventsResponse = await apiRequest('GET', `/api/events?weddingProfileId=${profile.id}`);
            const events = await eventsResponse.json();
            
            // If no events exist, user needs to set up events
            if (events.length === 0) {
              setNeedsEventSetup(true);
            }
          } catch (error) {
            console.error('Failed to fetch events:', error);
            // If we get an auth error, clear the stored data
            if (error instanceof Error && error.message.includes('401')) {
              localStorage.removeItem('user');
              localStorage.removeItem('weddingProfile');
              setUser(null);
              setWeddingProfile(null);
            }
          }
        };
        
        checkEvents();
      }
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
        
        // Check if events exist for this profile
        const eventsResponse = await apiRequest('GET', `/api/events?weddingProfileId=${profile.id}`);
        const events = await eventsResponse.json();
        
        // If no events exist, user needs to set up events
        if (events.length === 0) {
          setNeedsEventSetup(true);
        }
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
    
    // Check if we need to set up events
    setNeedsEventSetup(true);
  };

  const handleEventSetupComplete = () => {
    setNeedsEventSetup(false);
  };

  const handleLogout = () => {
    setUser(null);
    setWeddingProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('weddingProfile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            WeddingWizard
          </h2>
          <p className="text-neutral-600 animate-pulse">Loading your magical journey...</p>
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
        ) : needsEventSetup ? (
          <EventLogistics weddingProfile={weddingProfile} onComplete={handleEventSetupComplete} />
        ) : (
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar weddingProfile={weddingProfile} onLogout={handleLogout} />
            <main className="flex-1 overflow-hidden page-transition">
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
