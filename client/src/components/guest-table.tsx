import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2, Plus, Search, Filter, Users, ChevronUp, ChevronDown } from "lucide-react";
import { Guest, insertGuestSchema, WeddingProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

const guestFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  side: z.string().min(1, "Side is required"),
  rsvpStatus: z.string().min(1, "RSVP status is required"),
});

type GuestFormData = z.infer<typeof guestFormSchema>;

interface GuestTableProps {
  weddingProfile: WeddingProfile;
}

export function GuestTable({ weddingProfile }: GuestTableProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [rsvpFilter, setRsvpFilter] = useState<string>("all");
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading: guestsLoading } = useQuery<Guest[]>({
    queryKey: ["/api/guests", weddingProfile?.id],
    queryFn: () => 
      weddingProfile 
        ? fetch(`/api/guests?weddingProfileId=${weddingProfile.id}`, {
            credentials: 'include',
          }).then(res => res.json())
        : Promise.resolve([]),
    enabled: !!weddingProfile,
  });
  const createGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      const response = await apiRequest("POST", "/api/guests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests", weddingProfile?.id] });
      setIsAddDialogOpen(false);
      form.reset({
        name: "",
        email: "",
        phone: "",
        side: "",
        rsvpStatus: "pending",
      });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Guest> }) => {
      console.log('Updating guest:', id, 'with data:', data);
      const response = await apiRequest("PUT", `/api/guests/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests", weddingProfile?.id] });
      setEditingGuest(null);
    },
    onError: (error) => {
      console.error('Update guest error:', error);
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/guests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guests", weddingProfile?.id] });
    },
  });

  // Get default side - return empty to require user selection
  const getDefaultSide = () => {
    return ""; // Return empty to require user to select a side
  };

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      side: "",
      rsvpStatus: "pending",
    },
  });

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const onSubmit = (data: GuestFormData) => {
    if (!weddingProfile) {
      alert('Wedding profile not found. Please try again.');
      return;
    }

    // Capitalize name and side
    const processedData = {
      ...data,
      name: capitalizeWords(data.name),
      side:
        data.side.charAt(0).toUpperCase() + data.side.slice(1).toLowerCase(),
      rsvpStatus:
        (data.rsvpStatus || "pending").charAt(0).toUpperCase() +
        (data.rsvpStatus || "pending").slice(1).toLowerCase(),
    };

    if (editingGuest) {
      // For updates, don't include weddingProfileId as it shouldn't change
      updateGuestMutation.mutate({ id: editingGuest.id, data: processedData });
    } else {
      // For new guests, include weddingProfileId
      createGuestMutation.mutate({
        ...processedData,
        weddingProfileId: weddingProfile.id,
      } as any); // Type assertion needed since our form schema doesn't include weddingProfileId
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    // Normalize RSVP status to lowercase for form compatibility
    const normalizedRsvpStatus = (guest.rsvpStatus || "pending").toLowerCase();
    form.reset({
      name: guest.name,
      email: guest.email || "",
      phone: guest.phone || "",
      side: guest.side,
      rsvpStatus: normalizedRsvpStatus,
    });
  };

  const handleDelete = (guest: Guest) => {
    setGuestToDelete(guest);
  };

  const confirmDelete = () => {
    if (guestToDelete) {
      deleteGuestMutation.mutate(guestToDelete.id);
    }
  };

  const getSideColor = (side: string) => {
    const sideKey = side.toLowerCase();
    
    // Different colors for each side
    if (weddingProfile) {
      const brideLastName = weddingProfile?.brideName?.split(' ').pop()?.toLowerCase() || '';
      const groomLastName = weddingProfile?.groomName?.split(' ').pop()?.toLowerCase() || '';
      
      if (sideKey === brideLastName) {
        return "bg-pink-100 text-pink-800 border-pink-200";
      } else if (sideKey === groomLastName) {
        return "bg-blue-100 text-blue-800 border-blue-200";
      }
    }
    
    if (sideKey === 'friends') {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRsvpColor = (status: string) => {
    // Normalize the status to handle both cases
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const colors = {
      Confirmed: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Declined: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[normalizedStatus as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and search logic
  const filteredGuests = useMemo(() => {
    const filtered = guests.filter((guest) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (guest.phone && guest.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      // Side filter
      const matchesSide = sideFilter === "all" || guest.side.toLowerCase() === sideFilter.toLowerCase();

      // RSVP filter
      const matchesRsvp = rsvpFilter === "all" || 
        (guest.rsvpStatus && guest.rsvpStatus.toLowerCase() === rsvpFilter.toLowerCase());

      return matchesSearch && matchesSide && matchesRsvp;
    });

    // Sort guests based on current sort field and direction
    return filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "side":
          aValue = a.side.toLowerCase();
          bValue = b.side.toLowerCase();
          break;
        case "rsvp":
          aValue = (a.rsvpStatus || "pending").toLowerCase();
          bValue = (b.rsvpStatus || "pending").toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [guests, searchQuery, sideFilter, rsvpFilter, sortField, sortDirection]);

  // Calculate statistics
  const stats = useMemo(() => {
    const sideCounts = guests.reduce((acc, guest) => {
      const side = guest.side;
      acc[side] = (acc[side] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const rsvpCounts = guests.reduce((acc, guest) => {
      const status = guest.rsvpStatus || "Pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: guests.length,
      sideCounts,
      rsvpCounts,
    };
  }, [guests]);

  if (guestsLoading) {
    return <div className="flex justify-center p-8">Loading guests...</div>;
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-rose-50 via-white to-blue-50 min-h-screen p-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-rose-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-sm font-semibold text-rose-700 mb-3">Total Guests</h4>
          <p className="text-3xl font-bold text-rose-900">{stats.total}</p>
        </div>
        {weddingProfile && (
          <>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-sm font-semibold text-pink-700 mb-3">
                {weddingProfile?.brideName?.split(' ').pop() || 'Bride'}
              </h4>
              <p className="text-3xl font-bold text-pink-900">
                {stats.sideCounts[weddingProfile?.brideName?.split(' ').pop() || ""] || 0}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-sm font-semibold text-blue-700 mb-3">
                {weddingProfile?.groomName?.split(' ').pop() || 'Groom'}
              </h4>
              <p className="text-3xl font-bold text-blue-900">
                {stats.sideCounts[weddingProfile?.groomName?.split(' ').pop() || ""] || 0}
              </p>
            </div>
          </>
        )}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-sm font-semibold text-purple-700 mb-3">Friends</h4>
          <p className="text-3xl font-bold text-purple-900">{stats.sideCounts["Friends"] || 0}</p>
        </div>
      </div>

      {/* RSVP Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-sm font-semibold text-green-700 mb-3">Confirmed</h4>
          <p className="text-3xl font-bold text-green-900">{stats.rsvpCounts["Confirmed"] || 0}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-sm font-semibold text-amber-700 mb-3">Pending</h4>
          <p className="text-3xl font-bold text-amber-900">{stats.rsvpCounts["Pending"] || 0}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="text-sm font-semibold text-red-700 mb-3">Declined</h4>
          <p className="text-3xl font-bold text-red-900">{stats.rsvpCounts["Declined"] || 0}</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 w-4 h-4" />
            <Input
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/90 border-rose-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
            />
          </div>
          <Select value={sideFilter} onValueChange={setSideFilter}>
            <SelectTrigger className="bg-white/90 border-rose-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl">
              <SelectValue placeholder="Filter by side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sides</SelectItem>
              {weddingProfile && (
                <>
                  <SelectItem value={weddingProfile?.brideName?.split(' ').pop() || ""}>
                    {weddingProfile?.brideName?.split(' ').pop() || 'Bride'}
                  </SelectItem>
                  <SelectItem value={weddingProfile?.groomName?.split(' ').pop() || ""}>
                    {weddingProfile?.groomName?.split(' ').pop() || 'Groom'}
                  </SelectItem>
                </>
              )}
              <SelectItem value="Friends">Friends</SelectItem>
            </SelectContent>
          </Select>
          <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
            <SelectTrigger className="bg-white/90 border-rose-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl">
              <SelectValue placeholder="Filter by RSVP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RSVP</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSideFilter("all");
                setRsvpFilter("all");
              }}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 rounded-xl transition-all duration-200"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100 shadow-lg">
          Guest List 
        </h3>
        <Dialog
          open={isAddDialogOpen || !!editingGuest}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingGuest(null);
              form.reset({
                name: "",
                email: "",
                phone: "",
                side: "",
                rsvpStatus: "pending",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setIsAddDialogOpen(true);
                setEditingGuest(null);
                form.reset({
                  name: "",
                  email: "",
                  phone: "",
                  side: "",
                  rsvpStatus: "pending",
                });
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGuest ? "Edit Guest" : "Add New Guest"}
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter guest name"
                          autoComplete="off"
                        />
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
                        <Input
                          {...field}
                          placeholder="Enter email address"
                          autoComplete="off"
                          value={field.value || ""}
                        />
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
                        <Input
                          {...field}
                          placeholder="Enter phone number"
                          autoComplete="off"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select side" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weddingProfile && (
                            <>
                              <SelectItem value={weddingProfile?.brideName?.split(' ').pop() || ""}>
                                {weddingProfile?.brideName?.split(' ').pop() || 'Bride'}
                              </SelectItem>
                              <SelectItem value={weddingProfile?.groomName?.split(' ').pop() || ""}>
                                {weddingProfile?.groomName?.split(' ').pop() || 'Groom'}
                              </SelectItem>
                            </>
                          )}
                          <SelectItem value="Friends">Friends</SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingGuest(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createGuestMutation.isPending || updateGuestMutation.isPending}
                  >
                    {editingGuest ? "Update" : "Add"} Guest
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <TableHead 
                className="text-rose-900 font-semibold py-4 cursor-pointer hover:bg-rose-100 transition-colors duration-200"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortField === "name" && (
                    sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-rose-900 font-semibold py-4">Email</TableHead>
              <TableHead className="text-rose-900 font-semibold py-4">Phone</TableHead>
              <TableHead 
                className="text-rose-900 font-semibold py-4 cursor-pointer hover:bg-rose-100 transition-colors duration-200"
                onClick={() => handleSort("side")}
              >
                <div className="flex items-center space-x-1">
                  <span>Side</span>
                  {sortField === "side" && (
                    sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-rose-900 font-semibold py-4 cursor-pointer hover:bg-rose-100 transition-colors duration-200"
                onClick={() => handleSort("rsvp")}
              >
                <div className="flex items-center space-x-1">
                  <span>RSVP</span>
                  {sortField === "rsvp" && (
                    sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-rose-900 font-semibold py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest, index) => (
              <TableRow 
                key={guest.id}
                className={`hover:bg-rose-50/50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white/50' : 'bg-rose-50/30'
                }`}
              >
                <TableCell className="py-4">
                  <span className="font-semibold text-gray-800">{guest.name}</span>
                </TableCell>
                <TableCell className="py-4 text-gray-600">{guest.email || "-"}</TableCell>
                <TableCell className="py-4 text-gray-600">{guest.phone || "-"}</TableCell>
                <TableCell className="py-4">
                  <Badge className={`${getSideColor(guest.side)} font-semibold px-3 py-1 rounded-full`}>
                    {guest.side}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className={`${getRsvpColor(guest.rsvpStatus || "Pending")} font-semibold px-3 py-1 rounded-full`}
                  >
                    {(guest.rsvpStatus || "Pending").charAt(0).toUpperCase() + (guest.rsvpStatus || "Pending").slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(guest)}
                      className="hover:bg-rose-100 text-rose-700 hover:text-rose-800 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                                                    onClick={() => handleDelete(guest)}
                      className="hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!guestToDelete}
        onClose={() => setGuestToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Guest"
        description="Are you sure you want to delete this guest? This action cannot be undone."
        itemName={guestToDelete?.name}
        itemDetails={guestToDelete ? `${guestToDelete.side} • ${guestToDelete.email || 'No email'}` : undefined}
        itemIcon={<Users className="w-5 h-5 text-red-600" />}
        confirmText="Delete Guest"
      />
    </div>
  );
}
