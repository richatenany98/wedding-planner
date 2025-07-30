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
import { Button } from "@/components/ui/button";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user is already logged in by checking the server session
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const userData = await response.json();
        setUser(userData);
        
        if (userData.weddingProfileId) {
          try {
            const profileResponse = await apiRequest('GET', `/api/wedding-profile/${userData.weddingProfileId}`);
            const profile = await profileResponse.json();
            setWeddingProfile(profile);
            
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
      } catch (error) {
        console.log('No active session found');
        // Clear any stale localStorage data
        localStorage.removeItem('user');
        localStorage.removeItem('weddingProfile');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLogin = async (userData: User, options: { isNew: boolean } = { isNew: false }): Promise<void> => {
    console.log('🔐 Login successful! User data:', userData);
    console.log('🔐 User has weddingProfileId:', userData.weddingProfileId);
    setUser(userData);

    if (userData.weddingProfileId) {
      console.log('📋 User has wedding profile, fetching it...');
      try {
        const response = await apiRequest('GET', `/api/wedding-profile/${userData.weddingProfileId}`);
        const profile = await response.json();
        console.log('📋 Wedding profile fetched:', profile);
        setWeddingProfile(profile);

        // Check if events exist for this profile
        const eventsResponse = await apiRequest('GET', `/api/events?weddingProfileId=${profile.id}`);
        const events = await eventsResponse.json();

        // If no events exist, user needs to set up events
        if (events.length === 0) {
          console.log('📅 No events found, showing event setup');
          setNeedsEventSetup(true);
        } else {
          console.log('📅 Events found, going to dashboard');
        }
      } catch (error) {
        console.error('❌ Failed to fetch wedding profile:', error);
        // If wedding profile fetch fails, show onboarding
        setShowOnboarding(true);
      }
    } else {
      console.log('📋 User has no wedding profile, showing onboarding');
      // User doesn't have a wedding profile, show onboarding
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async (profile: WeddingProfile) => {
    console.log('🎉 Onboarding completed! Profile:', profile);
    setWeddingProfile(profile);
    
    // Update user with wedding profile ID
    if (user) {
      const updatedUser = { ...user, weddingProfileId: profile.id };
      setUser(updatedUser);
      // Save updated user to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('👤 Updated user with wedding profile ID:', updatedUser);
    }
    
    // Save wedding profile to localStorage
    localStorage.setItem('weddingProfile', JSON.stringify(profile));
    
    // Hide onboarding and go directly to dashboard
    setShowOnboarding(false);
    setNeedsEventSetup(false);
    console.log('✅ Routing to dashboard...');
  };

  const handleEventSetupComplete = () => {
    setNeedsEventSetup(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setWeddingProfile(null);
      localStorage.removeItem('user');
      localStorage.removeItem('weddingProfile');
    }
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
        {(() => {
          console.log('🔍 Render state:', {
            hasUser: !!user,
            showOnboarding,
            hasWeddingProfile: !!weddingProfile,
            needsEventSetup
          });
          
          if (!user) {
            console.log('📱 Rendering: Login');
            return <Login onLogin={(userData, options) => handleLogin(userData, options)} />;
          } else if (showOnboarding) {
            console.log('📱 Rendering: Onboarding');
            return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
          } else if (!weddingProfile) {
            console.log('📱 Rendering: Onboarding (no profile)');
            return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
          } else if (needsEventSetup) {
            console.log('📱 Rendering: Event Setup');
            return <EventLogistics weddingProfile={weddingProfile} onComplete={handleEventSetupComplete} />;
          } else {
            console.log('📱 Rendering: Dashboard');
            return (
              <div className="min-h-screen flex flex-col lg:flex-row">
                <Sidebar weddingProfile={weddingProfile} onLogout={handleLogout} />
                <main className="flex-1 overflow-hidden page-transition">
                  <Router weddingProfile={weddingProfile} />
                </main>
              </div>
            );
          }
        })()}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
