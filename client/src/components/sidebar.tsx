import { Link, useLocation } from 'wouter';
import { Heart, Calendar, Users, CheckSquare, MapPin, DollarSign, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentRole } from '@/hooks/use-current-role';
import { RoleSelector } from './role-selector';
import { WeddingProfile } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface SidebarProps {
  weddingProfile: WeddingProfile;
  onLogout: () => void;
}

export function Sidebar({ weddingProfile, onLogout }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser } = useCurrentRole(weddingProfile);

  // Fetch real-time stats
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events', weddingProfile.id],
    queryFn: () => 
      fetch(`/api/events?weddingProfileId=${weddingProfile.id}`, {
        credentials: 'include',
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }),
    enabled: !!weddingProfile.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['/api/guests', weddingProfile.id],
    queryFn: () => 
      fetch(`/api/guests?weddingProfileId=${weddingProfile.id}`, {
        credentials: 'include',
      }).then(res => { 
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }),
    enabled: !!weddingProfile.id,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Calculate stats
  const eventCount = events.length;
  const guestCount = guests.length;

  const navigation = [
    { name: 'Events', href: '/', icon: Calendar },
    { name: 'Guest List', href: '/guests', icon: Users },
    { name: 'Task Board', href: '/tasks', icon: CheckSquare },
    { name: 'Vendors', href: '/vendors', icon: MapPin },
    { name: 'Budget', href: '/budget', icon: DollarSign },
  ];

  return (
    <nav className="lg:w-72 glass-morphism border-r border-white/20 flex-shrink-0 flex flex-col h-full">
      <div className="p-8 flex-1">
        {/* Enhanced Logo Section */}
        <div className="flex items-center space-x-4 mb-10">
          <div className="relative">
            <div className="w-12 h-12 wedding-gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="text-white" size={24} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 wedding-gradient-gold rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={10} />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {weddingProfile.brideName} & {weddingProfile.groomName}
            </h1>
            <p className="text-sm text-neutral-600 font-medium">{weddingProfile.city}, {weddingProfile.state}</p>
            <p className="text-xs text-neutral-500">{weddingProfile.weddingStartDate} - {weddingProfile.weddingEndDate}</p>
          </div>
        </div>

        {/* Role Selector with enhanced styling */}
        <div className="mb-8">
          <RoleSelector weddingProfile={weddingProfile} />
        </div>

        {/* Enhanced Navigation Menu */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
            Navigation
          </h3>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div className={`nav-item ${isActive ? 'active' : 'text-neutral-700 hover:text-neutral-900'}`}>
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                        <Icon size={20} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                  
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 p-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-white/30">
              <div className="text-lg font-bold text-rose-600">{eventCount}</div>
              <div className="text-xs text-neutral-600">Events</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/30">
              <div className="text-lg font-bold text-pink-600">{guestCount}</div>
              <div className="text-xs text-neutral-600">Guests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced User Profile Section */}
      <div className="p-6 border-t border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 wedding-gradient-pink rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">{currentUser.initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="font-semibold text-neutral-800">{currentUser.name}</p>
              <p className="text-sm text-neutral-600 capitalize">{currentUser.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="hover:bg-white/20 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-4 h-4 text-neutral-600" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
