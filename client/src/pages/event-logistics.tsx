import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, MapPin, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { WeddingProfile, Event } from '@shared/schema';

const eventLogisticsSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  guestCount: z.number().min(1, 'Guest count must be at least 1'),
});

type EventLogisticsFormData = z.infer<typeof eventLogisticsSchema>;

interface EventLogisticsProps {
  weddingProfile: WeddingProfile;
  onComplete: () => void;
}

const eventTemplates = [
  {
    id: 'ganesh-puja',
    name: 'Ganesh Puja',
    description: 'Prayer ceremony to Lord Ganesha for auspicious beginnings',
    icon: '🐘',
    color: 'orange',
    defaultTime: '10:00 AM - 12:00 PM',
    suggestedLocation: 'Family Home or Temple'
  },
  {
    id: 'welcome-party',
    name: 'Welcome Party',
    description: 'Welcome celebration for out-of-town guests',
    icon: '🎉',
    color: 'blue',
    defaultTime: '6:00 PM - 9:00 PM',
    suggestedLocation: 'Hotel or Restaurant'
  },
  {
    id: 'grah-shanti',
    name: 'Grah Shanti',
    description: 'Ceremony to remove obstacles and bring peace',
    icon: '🕉️',
    color: 'purple',
    defaultTime: '8:00 AM - 10:00 AM',
    suggestedLocation: 'Family Home or Temple'
  },
  {
    id: 'haldi',
    name: 'Haldi',
    description: 'Turmeric ceremony for purification and blessings',
    icon: '🌟',
    color: 'yellow',
    defaultTime: '10:00 AM - 12:00 PM',
    suggestedLocation: 'Family Home or Garden'
  },
  {
    id: 'mayra',
    name: 'Mayra',
    description: 'Maternal uncle\'s blessing ceremony',
    icon: '👨‍👩‍👧‍👦',
    color: 'green',
    defaultTime: '4:00 PM - 6:00 PM',
    suggestedLocation: 'Family Home'
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    description: 'Musical celebration with dance and performances',
    icon: '🎵',
    color: 'purple',
    defaultTime: '7:00 PM - 11:00 PM',
    suggestedLocation: 'Banquet Hall or Hotel'
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Main wedding ceremony with sacred rituals',
    icon: '💍',
    color: 'red',
    defaultTime: '9:00 AM - 1:00 PM',
    suggestedLocation: 'Temple or Banquet Hall'
  },
  {
    id: 'reception',
    name: 'Reception',
    description: 'Grand celebration and dinner for all guests',
    icon: '🥂',
    color: 'indigo',
    defaultTime: '7:00 PM - 12:00 AM',
    suggestedLocation: 'Banquet Hall or Hotel'
  },
];

export default function EventLogistics({ weddingProfile, onComplete }: EventLogisticsProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);

  const selectedFunctions = weddingProfile.functions || [];
  const eventsToSetup = eventTemplates.filter(template => 
    selectedFunctions.includes(template.id)
  );

  const currentEvent = eventsToSetup[currentEventIndex];
  const progress = ((currentEventIndex + 1) / eventsToSetup.length) * 100;

  const form = useForm<EventLogisticsFormData>({
    resolver: zodResolver(eventLogisticsSchema),
    defaultValues: {
      date: '',
      time: currentEvent?.defaultTime || '',
      location: '',
      guestCount: Math.floor(weddingProfile.guestCount / eventsToSetup.length) || 50,
    },
  });

  const onSubmit = async (data: EventLogisticsFormData) => {
    setIsLoading(true);
    
    try {
      const eventData = {
        name: currentEvent.name,
        description: currentEvent.description,
        date: data.date,
        time: data.time,
        location: data.location,
        guestCount: data.guestCount,
        icon: currentEvent.icon,
        color: currentEvent.color,
        progress: 0,
        weddingProfileId: weddingProfile.id,
      };

      await apiRequest('POST', '/api/events', eventData);
      
      setCompletedEvents([...completedEvents, currentEvent.id]);
      
      if (currentEventIndex < eventsToSetup.length - 1) {
        setCurrentEventIndex(currentEventIndex + 1);
        form.reset({
          date: '',
          time: eventsToSetup[currentEventIndex + 1]?.defaultTime || '',
          location: '',
          guestCount: Math.floor(weddingProfile.guestCount / eventsToSetup.length) || 50,
        });
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1);
    }
  };

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Event Logistics Setup</h1>
          <p className="text-gray-600">Let's set up the details for your wedding events</p>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">
              Event {currentEventIndex + 1} of {eventsToSetup.length}
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">{currentEvent.icon}</div>
            <CardTitle className="text-2xl text-gray-800">{currentEvent.name}</CardTitle>
            <p className="text-gray-600">{currentEvent.description}</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            placeholder="Select date" 
                            {...field}
                            min={weddingProfile.weddingStartDate}
                            max={weddingProfile.weddingEndDate}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 10:00 AM - 12:00 PM" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`e.g., ${currentEvent.suggestedLocation}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Expected Guests
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Number of guests"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentEventIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
                  >
                    {isLoading ? (
                      "Setting up..."
                    ) : currentEventIndex === eventsToSetup.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    ) : (
                      <>
                        Next Event
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {completedEvents.length > 0 && (
          <Card className="mt-4 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed Events:</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {completedEvents.map(eventId => {
                  const event = eventTemplates.find(e => e.id === eventId);
                  return (
                    <span key={eventId} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {event?.name}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}