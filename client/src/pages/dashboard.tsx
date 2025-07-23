import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { Event, insertEventSchema, WeddingProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

import { z } from "zod";

const eventFormSchema = insertEventSchema
  .extend({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
  })
  .omit({ weddingProfileId: true });

type EventFormData = z.infer<typeof eventFormSchema>;

const eventIcons = [
  { value: "hand-paper", label: "Bridal Mehndi", emoji: "💐", color: "red" },
  { value: "flower", label: "Ganesh Puja", emoji: "🙏", color: "orange" },
  { value: "home", label: "Welcome Party", emoji: "🎉", color: "yellow" },
  { value: "star", label: "Grah Shanti", emoji: "🌿", color: "green" },
  { value: "sun", label: "Haldi", emoji: "🌼", color: "blue" },
  { value: "sparkles", label: "Mayra", emoji: "🎁", color: "indigo" },
  { value: "music", label: "Sangeet", emoji: "💃", color: "purple" },
  { value: "horse", label: "Baraat", emoji: "🐎", color: "pink" },
  { value: "ring", label: "Wedding", emoji: "💍", color: "rose" },
  {
    value: "champagne-glasses",
    label: "Reception",
    emoji: "✨",
    color: "emerald",
  },
  { value: "cake", label: "Wedding Cake Cutting", emoji: "🍰", color: "amber" },
  { value: "camera", label: "Photography Session", emoji: "📸", color: "cyan" },
  { value: "car", label: "Transportation", emoji: "🚗", color: "slate" },
  { value: "gift", label: "Gift Exchange", emoji: "🎁", color: "violet" },
];

const eventDescriptions = {
  "hand-paper":
    "A chill, artsy pre-wedding hangout where the bride (and sometimes guests) get their hands and feet decorated with henna. It's usually relaxed, with music, snacks, and lots of photos.",
  flower:
    "A small but meaningful prayer ceremony to invite good vibes and remove any obstacles before all the big celebrations begin. It's usually done with close family.",
  home: 'This is the "hi, hello, let\'s kick things off" event — casual or fancy depending on the family. Think mingling, drinks, and everyone getting to know each other before the main events.',
  star: "Another peaceful prayer ceremony, usually done at home, to bring harmony and positive energy. It's spiritual and grounding before all the wedding madness starts.",
  sun: "A super fun and messy (in a good way) ceremony where the bride and groom get covered in turmeric paste by family and friends. It's supposed to bring glow and good luck — expect laughter and yellow everywhere.",
  sparkles:
    "A family tradition, especially in North Indian weddings, where the bride/groom's maternal uncle (mama) brings gifts and blessings. Lots of singing, family bonding, and sometimes a mini-feast too.",
  music:
    "The big pre-wedding party with all the dancing! Friends and family perform choreographed dances, there's music, outfits on point, and tons of energy. It's like a wedding concert-night.",
  horse:
    "The groom's grand arrival, usually on a horse (or sometimes a car, elephant, or even a tractor). His side dances their way to the wedding venue with a live band and lots of dhol. Pure hype.",
  ring: "The main event — the traditional wedding ceremony, often filled with rituals, blessings, and symbolic moments. Could be an hour or several, depending on the traditions followed.",
  "champagne-glasses":
    "The after-party! The newlyweds are officially introduced, there are speeches, great food, dancing, and everyone's dressed to the nines. It's the last hurrah of the wedding week.",
  cake: "A sweet moment where the newlyweds cut their wedding cake together, often followed by feeding each other the first slice. A beautiful photo opportunity and tradition.",
  camera: "Dedicated time for professional photography and videography sessions. This could be couple portraits, family photos, or creative shots around the venue.",
  car: "Transportation arrangements for guests, the wedding party, or special vehicles for the couple. This includes shuttles, limos, or traditional vehicles.",
  gift: "A ceremony or moment for exchanging gifts between families, often including traditional items, jewelry, or symbolic presents that represent the union.",
};

// Helper function to get emoji from icon value
const getEventEmoji = (iconValue: string) => {  
  if (iconValue && iconValue.length <= 2) {
    return iconValue;
  }
  const icon = eventIcons.find((icon) => icon.value === iconValue);
  return icon ? icon.emoji : "📅";
};

// Helper function to get description suggestion
const getEventSuggestion = (iconValue: string) => {
  return eventDescriptions[iconValue as keyof typeof eventDescriptions] || "";
};

// Helper function to get color class
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
    cyan: 'wedding-gradient-cyan',
    slate: 'wedding-gradient-slate',
    violet: 'wedding-gradient-violet',
  };
  return colorMap[color as keyof typeof colorMap] || 'wedding-gradient-gold';
};

// Helper function to get progress color
const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 60) return 'bg-yellow-600';
  if (progress >= 40) return 'bg-primary';
  return 'bg-red-600';
};

interface DashboardProps {
  weddingProfile: WeddingProfile;
}

export default function Dashboard({ weddingProfile }: DashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCustomEventName, setIsCustomEventName] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  // Get default date within wedding timeframe
  const getDefaultDate = () => {
    const startDate = new Date(weddingProfile.weddingStartDate);
    const endDate = new Date(weddingProfile.weddingEndDate);
    const today = new Date();

    // If today is within the wedding timeframe, use today
    if (today >= startDate && today <= endDate) {
      return today.toISOString().split("T")[0];
    }

    // Otherwise, use the start date
    return startDate.toISOString().split("T")[0];
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: getDefaultDate(),
      time: "",
      location: "",
      icon: "",
      color: "orange",
      guestCount: weddingProfile.guestCount || 0,
    },
  });

  // Watch for icon changes for suggestion display
  const selectedIcon = form.watch("icon");
  
  // Auto-set color when icon is selected
  useEffect(() => {
    if (selectedIcon) {
      const iconData = eventIcons.find(icon => icon.value === selectedIcon);
      if (iconData) {
        form.setValue("color", iconData.color);
      }
    }
  }, [selectedIcon, form]);



  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", weddingProfile.id],
    queryFn: () =>
      fetch(`/api/events?weddingProfileId=${weddingProfile.id}`, {
        credentials: 'include',
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = { ...data, weddingProfileId: weddingProfile.id };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
          onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["/api/events", weddingProfile.id],
        });
        setIsAddDialogOpen(false);
        setIsCustomEventName(false);
        form.reset({
          name: "",
          description: "",
          date: getDefaultDate(),
          time: "",
          location: "",
          icon: "",
          color: "orange",
          guestCount: weddingProfile.guestCount || 0,
        });
      },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Event> }) => {
      const response = await apiRequest("PUT", `/api/events/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/events", weddingProfile.id],
      });
      setEditingEvent(null);
      setIsCustomEventName(false);
      form.reset({
        name: "",
        description: "",
        date: getDefaultDate(),
        time: "",
        location: "",
        icon: "",
        color: "orange",
        guestCount: weddingProfile.guestCount || 0,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/events", weddingProfile.id],
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    console.log("Form data:", data);
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    // Check if the event name matches any predefined event
    const predefinedEvent = eventIcons.find(icon => icon.label === event.name);
    setIsCustomEventName(!predefinedEvent);
    form.reset({
      name: event.name,
      description: event.description || "",
      date: event.date,
      time: event.time,
      location: event.location,
      icon: event.icon,
      color: event.color,
      guestCount: event.guestCount || 0,
    });
  };

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container-wedding p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="loading-spinner h-12 w-12"></div>
        </div>
      </div>
    );
  }

  // Ensure events is always an array and sort chronologically
  const sortedEvents = [...(Array.isArray(events) ? events : [])].sort((a, b) => {
    // First sort by date
    const dateA = new Date(a.date + "T00:00:00").getTime();
    const dateB = new Date(b.date + "T00:00:00").getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    // If dates are the same, sort by time
    const parseTime = (timeStr: string) => {
      // Extract first time from strings like "11AM - 1PM" or "6:00 PM - 11:30 PM"
      const match = timeStr.match(
        /(\d{1,2}):?(\d{0,2})\s*(AM|PM)/i,
      );
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2] || "0");
        const ampm = match[3].toUpperCase();

        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        return hours * 60 + minutes; // Convert to minutes for comparison
      }
      return 0;
    };

    return parseTime(a.time) - parseTime(b.time);
  });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="wedding-card p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Wedding Timeline
              </h1>
              <p className="text-lg text-neutral-600 mb-4">
                Your magical celebration schedule
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4 text-rose-500" />
                  <span>{weddingProfile.weddingStartDate} - {weddingProfile.weddingEndDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>{weddingProfile.city}, {weddingProfile.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{weddingProfile.guestCount || 0} Guests</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="btn-wedding-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="wedding-card p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 wedding-gradient-rose rounded-xl flex items-center justify-center">
            <CalendarDays className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800">Event Schedule</h2>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 wedding-gradient-rose rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No events scheduled yet</h3>
            <p className="text-neutral-600 mb-6">Start building your wedding timeline by adding your first event.</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-wedding-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Timeline connector */}
                {index < sortedEvents.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-rose-200 to-pink-200"></div>
                )}
                
                <div className="wedding-card hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Date/Time Column */}
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="w-12 h-12 wedding-gradient-rose rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {new Date(event.date + "T00:00:00").getDate()}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-neutral-700">
                          {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-xs text-neutral-500 font-medium">
                          {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                      </div>

                      {/* Event Icon */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-white text-lg">
                            {getEventEmoji(event.icon)}
                          </span>
                        </div>
                        {index < sortedEvents.length - 1 && (
                          <div className="w-0.5 h-8 bg-gradient-to-b from-rose-200 to-pink-200 mt-2"></div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-grow">
                            <h3 className="font-bold text-neutral-800 text-xl mb-1">
                              {event.name}
                            </h3>
                            <p className="text-neutral-600 mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(event);
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
                                handleDelete(event);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="font-medium text-neutral-700">{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-pink-600" />
                            </div>
                            <span className="font-medium text-neutral-700">{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-medium text-neutral-700">{event.guestCount} guests</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Drawer */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Date & Time</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.location}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Guest Count</h4>
                <p className="text-sm text-gray-600">
                  {selectedEvent.guestCount} guests expected
                </p>
              </div>
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvent(null);
                    handleEdit(selectedEvent);
                  }}
                >
                  Edit Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedEvent(null);
                    handleDelete(selectedEvent);
                  }}
                >
                  Delete Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingEvent}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingEvent(null);
            setIsCustomEventName(false);
            form.reset({
              name: "",
              description: "",
              date: getDefaultDate(),
              time: "",
              location: "",
              icon: "",
              color: "orange",
              guestCount: weddingProfile.guestCount || 0,
            });
          }
        }}
      >
        <DialogContent className="max-w-2xl glass-morphism border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-neutral-700">Event Name</FormLabel>
                    <div className="space-y-3">
                      {!isCustomEventName ? (
                        <>
                          <Select
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setIsCustomEventName(true);
                                field.onChange("");
                                form.setValue("icon", "heart");
                                form.setValue("color", "amber");
                              } else {
                                const selectedEvent = eventIcons.find(
                                  (icon) => icon.value === value,
                                );
                                if (selectedEvent) {
                                  field.onChange(selectedEvent.label);
                                  form.setValue("icon", value);
                                  form.setValue("color", selectedEvent.color);
                                  // Only auto-populate description if it's currently empty
                                  const currentDescription = form.getValues("description") || "";
                                  if (!currentDescription.trim()) {
                                    const suggestion = getEventSuggestion(value);
                                    if (suggestion) {
                                      form.setValue("description", suggestion);
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full wedding-input">
                                <SelectValue placeholder="Select an event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-morphism border-white/20 max-h-60 w-[var(--radix-select-trigger-width)]">
                              <div className="p-2">
                                <div className="text-sm font-medium text-neutral-600 mb-2 px-2">Popular Event Types</div>
                                {eventIcons.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value} className="py-2">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg">{icon.emoji}</span>
                                      <div className="flex-1">
                                        <div className="font-medium">{icon.label}</div>
                                        <div className="text-xs text-neutral-500 line-clamp-1">
                                          {getEventSuggestion(icon.value)}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                                <div className="border-t border-neutral-200 mt-2 pt-2">
                                  <SelectItem value="custom" className="py-2">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg">✏️</span>
                                      <div className="flex-1">
                                        <div className="font-medium">Custom Event</div>
                                        <div className="text-xs text-neutral-500">
                                          Enter your own event name
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                </div>
                              </div>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-neutral-500">
                            💡 Select from popular event types or choose "Custom Event" to enter your own
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Input
                                placeholder="Enter custom event name"
                                {...field}
                                className="wedding-input flex-1"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsCustomEventName(false);
                                field.onChange("");
                                form.setValue("icon", "");
                                form.setValue("color", "orange");
                              }}
                              className="whitespace-nowrap"
                            >
                              Back to List
                            </Button>
                          </div>
                          <div className="text-xs text-neutral-500">
                            ✏️ Enter your custom event name
                          </div>
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-neutral-700">Description</FormLabel>
                    {selectedIcon && getEventSuggestion(selectedIcon) && !(form.getValues("description") || "").trim() && (
                      <div className="text-sm text-neutral-600 bg-rose-50 p-3 rounded-lg mb-2 border border-rose-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <strong>Suggestion:</strong> {getEventSuggestion(selectedIcon)}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2 h-6 px-2 text-xs"
                            onClick={() => form.setValue("description", getEventSuggestion(selectedIcon))}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    )}
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description"
                        {...field}
                        value={field.value || ""}
                        className="wedding-input min-h-[100px]"
                      />
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
                      <FormLabel className="text-sm font-semibold text-neutral-700">Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="wedding-input" />
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
                      <FormLabel className="text-sm font-semibold text-neutral-700">Time</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10:00 AM - 12:00 PM"
                          {...field}
                          className="wedding-input"
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
                    <FormLabel className="text-sm font-semibold text-neutral-700">Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter event location"
                        {...field}
                        className="wedding-input"
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
                    <FormLabel className="text-sm font-semibold text-neutral-700">Expected Guest Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter number of guests"
                        {...field}
                        value={field.value || 0}
                        className="wedding-input"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingEvent(null);
                    setIsCustomEventName(false);
                    form.reset({
                      name: "",
                      description: "",
                      date: getDefaultDate(),
                      time: "",
                      location: "",
                      icon: "",
                      color: "orange",
                      guestCount: weddingProfile.guestCount || 0,
                    });
                  }}
                  className="hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button type="submit" className="btn-wedding-primary">
                  {editingEvent ? "Update" : "Add"} Event
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!eventToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setEventToDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md glass-morphism border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-lg">
                  {eventToDelete ? getEventEmoji(eventToDelete.icon) : "📅"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">{eventToDelete?.name}</h3>
                <p className="text-sm text-neutral-600">
                  {eventToDelete?.date} • {eventToDelete?.time}
                </p>
              </div>
            </div>
            <p className="text-neutral-600">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEventToDelete(null)}
                className="hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
