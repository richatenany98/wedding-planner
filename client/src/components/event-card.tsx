import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, Calendar, Clock, MapPin, Users } from 'lucide-react';
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 60) return 'bg-yellow-600';
    if (progress >= 40) return 'bg-primary';
    return 'bg-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getColorClass(event.color)} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-lg">
                {event.icon === 'sun' && '☀️'}
                {event.icon === 'hand-paper' && '✋'}
                {event.icon === 'music' && '🎵'}
                {event.icon === 'ring' && '💍'}
                {event.icon === 'champagne-glasses' && '🥂'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">{event.name}</h3>
              <p className="text-sm text-neutral-500">{event.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-neutral-600">
            <Calendar className="w-4 h-4 mr-3" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <Clock className="w-4 h-4 mr-3" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <MapPin className="w-4 h-4 mr-3" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <Users className="w-4 h-4 mr-3" />
            <span>{event.guestCount} guests invited</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Planning Progress</span>
            <span className={`text-sm font-medium ${getProgressColor(event.progress).replace('bg-', 'text-')}`}>
              {event.progress}%
            </span>
          </div>
          <Progress value={event.progress} className="mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
