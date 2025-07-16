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
  { value: "heart", label: "Custom Event", emoji: "💕", color: "amber" },
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
};

// Helper function to get emoji from icon value
const getEventEmoji = (iconValue: string) => {
  const icon = eventIcons.find((icon) => icon.value === iconValue);
  return icon ? icon.emoji : iconValue.startsWith("🎉") ? iconValue : "📅";
};

// Helper function to get description suggestion
const getEventSuggestion = (iconValue: string) => {
  return eventDescriptions[iconValue as keyof typeof eventDescriptions] || "";
};

interface DashboardProps {
  weddingProfile: WeddingProfile;
}

export default function Dashboard({ weddingProfile }: DashboardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", weddingProfile.id],
    queryFn: () =>
      fetch(`/api/events?weddingProfileId=${weddingProfile.id}`).then((res) =>
        res.json(),
      ),
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading events...</div>;
  }

  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">
                Wedding Dashboard
              </h2>
              <p className="text-neutral-600">
                {weddingProfile.brideName} & {weddingProfile.groomName} •{" "}
                {weddingProfile.weddingStartDate} -{" "}
                {weddingProfile.weddingEndDate}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome to Your Wedding Dashboard!
            </h2>
            <p className="text-gray-600 mb-4">
              Your wedding events are being set up. Once configured, you'll see
              all your events here.
            </p>
            <div className="text-sm text-gray-500">
              Wedding Date: {weddingProfile.weddingStartDate} -{" "}
              {weddingProfile.weddingEndDate}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              Wedding Dashboard
            </h2>
            <p className="text-neutral-600">
              {weddingProfile.brideName} & {weddingProfile.groomName} •{" "}
              {weddingProfile.weddingStartDate} -{" "}
              {weddingProfile.weddingEndDate}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog
              open={isAddDialogOpen || !!editingEvent}
              onOpenChange={(open) => {
                if (!open) {
                  setIsAddDialogOpen(false);
                  setEditingEvent(null);
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
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "Edit Event" : "Add New Event"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <div className="relative">
                            <Select
                              onValueChange={(value) => {
                                const selectedEvent = eventIcons.find(
                                  (icon) => icon.value === value,
                                );
                                if (selectedEvent) {
                                  field.onChange(selectedEvent.label);
                                  form.setValue("icon", value);
                                  form.setValue("color", selectedEvent.color);
                                  // Only auto-populate description if it's currently empty
                                  const currentDescription =
                                    form.getValues("description");
                                  if (!currentDescription.trim()) {
                                    const suggestion =
                                      getEventSuggestion(value);
                                    if (suggestion) {
                                      form.setValue("description", suggestion);
                                    }
                                  }
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="absolute right-0 top-0 w-10 h-full border-0 bg-transparent">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {eventIcons.map((icon) => (
                                  <SelectItem
                                    key={icon.value}
                                    value={icon.value}
                                  >
                                    {icon.emoji} {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                placeholder="Enter event name or select from dropdown"
                                {...field}
                                className="pr-12"
                              />
                            </FormControl>
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
                          <FormLabel>Description</FormLabel>
                          {selectedIcon &&
                            getEventSuggestion(selectedIcon) &&
                            !form.getValues("description").trim() && (
                              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md mb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <strong>Suggestion:</strong>{" "}
                                    {getEventSuggestion(selectedIcon)}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="ml-2 h-6 px-2 text-xs"
                                    onClick={() =>
                                      form.setValue(
                                        "description",
                                        getEventSuggestion(selectedIcon),
                                      )
                                    }
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
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event location"
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
                          <FormLabel>Expected Guest Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter number of guests"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          setEditingEvent(null);
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
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingEvent ? "Update" : "Add"} Event
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
        {/* Timeline View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Wedding Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(events) && events.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No events scheduled yet</p>
                <p className="text-sm text-gray-400">
                  Add your first event to start planning your wedding timeline
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(events) &&
                  events
                    .sort((a, b) => {
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
                    })
                    .map((event, index) => (
                      <div
                        key={event.id}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex-shrink-0 w-24 text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {new Date(
                              event.date + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            {new Date(
                              event.date + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(
                              event.date + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                            })}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full bg-${event.color}-500 shadow-sm`}
                          />
                          {index < events.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xl w-6 h-6 flex items-center justify-center flex-shrink-0">
                                  {getEventEmoji(event.icon)}
                                </span>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {event.name}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {event.description}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {event.time}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {event.location}
                                </span>
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {event.guestCount} guests
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(event);
                                }}
                              >
                                <Edit className="w-4 h-4 flex-shrink-0" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(event.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 flex-shrink-0" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                      handleDelete(selectedEvent.id);
                    }}
                  >
                    Delete Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
