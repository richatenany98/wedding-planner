import { Link, useLocation } from 'wouter';
import { Heart, Calendar, Users, CheckSquare, MapPin, DollarSign } from 'lucide-react';
import { useCurrentRole } from '@/hooks/use-current-role';
import { RoleSelector } from './role-selector';

export function Sidebar() {
  const [location] = useLocation();
  const { currentUser } = useCurrentRole();

  const navigation = [
    { name: 'Events', href: '/', icon: Calendar },
    { name: 'Guest Lists', href: '/guests', icon: Users },
    { name: 'Task Board', href: '/tasks', icon: CheckSquare },
    { name: 'Vendors', href: '/vendors', icon: MapPin },
    { name: 'Budget', href: '/budget', icon: DollarSign },
  ];

  return (
    <nav className="lg:w-64 bg-white shadow-lg border-r border-neutral-200 flex-shrink-0 flex flex-col h-full">
      <div className="p-6 flex-1">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 wedding-gradient-gold rounded-xl flex items-center justify-center">
            <Heart className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Wedding Planner</h1>
            <p className="text-sm text-neutral-500">Indian Weddings</p>
          </div>
        </div>

        {/* Role Selector */}
        <RoleSelector />

        {/* Navigation Menu */}
        <ul className="space-y-2 mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Profile */}
      <div className="p-6 border-t border-neutral-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 wedding-gradient-pink rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{currentUser.initials}</span>
          </div>
          <div>
            <p className="font-medium text-neutral-800">{currentUser.name}</p>
            <p className="text-sm text-neutral-500 capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
