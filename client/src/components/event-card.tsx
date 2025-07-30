import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Event } from '@shared/schema';

interface EventCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const getColorClass = (color: string) => {
    const colorMap = {
      red: 'wedding-gradient-red',
      orange: 'wedding-gradient-orange',
      yellow: 'wedding-gradient-yellow',
      green: 'wedding-gradient-green',
      blue: 'wedding-gradient-blue',
      indigo: 'wedding-gradient-indigo',
      purple: 'wedding-gradient-purple',
      pink: 'wedding-gradient-pink',
      rose: 'wedding-gradient-rose',
      emerald: 'wedding-gradient-emerald',
      amber: 'wedding-gradient-amber',
    };
    return colorMap[color as keyof typeof colorMap] || 'wedding-gradient-gold';
  };

  const getEventIcon = (iconValue: string) => {
    // If the iconValue is already an emoji, return it directly
    if (iconValue && iconValue.length <= 2) {
      return iconValue;
    }
    
    // Otherwise, map the string identifier to emoji
    const iconMap = {
      'hand-paper': '💐',
      'flower': '🙏',
      'home': '🎉',
      'star': '🌿',
      'sun': '🌼',
      'sparkles': '🎁',
      'music': '💃',
      'horse': '🐎',
      'ring': '💍',
      'champagne-glasses': '✨',
      'heart': '💕',
    };
    return iconMap[iconValue as keyof typeof iconMap] || iconValue;
  };



  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        console.warn('Date string is undefined or empty');
        return 'Invalid Date';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString);
      return 'Invalid Date';
    }
  };

  return (
    <div className="wedding-card hover:shadow-xl transition-all duration-300 group cursor-pointer">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">
                {getEventIcon(event.icon)}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 text-lg">{event.name}</h3>
              <p className="text-sm text-neutral-600 line-clamp-2">{event.description}</p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="h-8 w-8 p-0 hover:bg-white/20"
            >
              <Edit className="h-4 w-4 text-neutral-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="h-8 w-8 p-0 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-neutral-600">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <span className="font-medium">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-pink-600" />
            </div>
            <span className="font-medium">{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">{event.guestCount} guests invited</span>
          </div>
        </div>

      </div>
    </div>
  );
}
