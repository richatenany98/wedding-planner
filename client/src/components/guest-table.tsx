import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Guest, Event, insertGuestSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

const guestFormSchema = insertGuestSchema.extend({
  eventIds: z.array(z.string()).optional(),
});

type GuestFormData = z.infer<typeof guestFormSchema>;

export function GuestTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ['/api/guests'],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const createGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const response = await apiRequest('POST', '/api/guests', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      setIsAddDialogOpen(false);
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Guest> }) => {
      const response = await apiRequest('PUT', `/api/guests/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      setEditingGuest(null);
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/guests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
    },
  });

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relation: '',
      eventIds: [],
      rsvpStatus: 'pending',
    },
  });

  const onSubmit = (data: GuestFormData) => {
    if (editingGuest) {
      updateGuestMutation.mutate({ id: editingGuest.id, data });
    } else {
      createGuestMutation.mutate(data);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    form.reset({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      relation: guest.relation,
      eventIds: guest.eventIds || [],
      rsvpStatus: guest.rsvpStatus || 'pending',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      deleteGuestMutation.mutate(id);
    }
  };

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === parseInt(eventId));
    return event?.name || '';
  };

  const getRelationColor = (relation: string) => {
    const colors = {
      'Friend': 'bg-blue-100 text-blue-800',
      'Family': 'bg-green-100 text-green-800',
      'Colleague': 'bg-purple-100 text-purple-800',
      'Relative': 'bg-yellow-100 text-yellow-800',
    };
    return colors[relation as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRsvpColor = (status: string) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'declined': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (guestsLoading) {
    return <div className="flex justify-center p-8">Loading guests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Guest List</h3>
        <Dialog open={isAddDialogOpen || !!editingGuest} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingGuest(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                          <SelectItem value="Relative">Relative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rsvpStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSVP Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select RSVP status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingGuest(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingGuest ? 'Update' : 'Add'} Guest
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {guest.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium">{guest.name}</span>
                  </div>
                </TableCell>
                <TableCell>{guest.email || '-'}</TableCell>
                <TableCell>{guest.phone || '-'}</TableCell>
                <TableCell>
                  <Badge className={getRelationColor(guest.relation)}>
                    {guest.relation}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {guest.eventIds?.map(eventId => (
                      <Badge key={eventId} variant="outline" className="text-xs">
                        {getEventName(eventId)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRsvpColor(guest.rsvpStatus || 'pending')}>
                    {guest.rsvpStatus || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(guest)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(guest.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
