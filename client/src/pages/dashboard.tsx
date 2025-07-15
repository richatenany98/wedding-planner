import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { EventCard } from '@/components/event-card';
import { Event, insertEventSchema, WeddingProfile } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

import { z } from 'zod';

const eventFormSchema = insertEventSchema.extend({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});

type EventFormData = z.infer<typeof eventFormSchema>;

const eventIcons = [
  { value: 'sun', label: 'Sun (Haldi)', emoji: '☀️' },
  { value: 'hand-paper', label: 'Hand (Mehndi)', emoji: '✋' },
  { value: 'music', label: 'Music (Sangeet)', emoji: '🎵' },
  { value: 'ring', label: 'Ring (Wedding)', emoji: '💍' },
  { value: 'champagne-glasses', label: 'Champagne (Reception)', emoji: '🥂' },
];

const eventColors = [
  { value: 'yellow', label: 'Yellow/Gold' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
  { value: 'indigo', label: 'Indigo' },
];

interface DashboardProps {
  weddingProfile: WeddingProfile;
}

export default function Dashboard({ weddingProfile }: DashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest('POST', '/api/events', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Event> }) => {
      const response = await apiRequest('PUT', `/api/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setEditingEvent(null);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      date: '',
      time: '',
      location: '',
      icon: 'sun',
      color: 'yellow',
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      name: event.name,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location,
      icon: event.icon,
      color: event.color,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading events...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Wedding Dashboard</h2>
            <p className="text-neutral-600">{weddingProfile.brideName} & {weddingProfile.groomName} • {weddingProfile.weddingStartDate} - {weddingProfile.weddingEndDate}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isAddDialogOpen || !!editingEvent} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingEvent(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter event description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 10:00 AM - 12:00 PM" {...field} />
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
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {eventIcons.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    {icon.emoji} {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {eventColors.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    {color.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingEvent(null);
                        form.reset();
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingEvent ? 'Update' : 'Add'} Event
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => handleEdit(event)}
              onDelete={() => handleDelete(event.id)}
            />
          ))}
          
          {/* Add Event Card */}
          <Card 
            className="border-2 border-dashed border-neutral-300 hover:border-primary transition-colors cursor-pointer"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="text-neutral-400" size={24} />
                </div>
                <h3 className="font-semibold text-neutral-700 mb-2">Add New Event</h3>
                <p className="text-sm text-neutral-500">Create another wedding ceremony</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
