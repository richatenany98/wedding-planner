import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, ExternalLink, Phone, Mail, Building2 } from 'lucide-react';
import { Vendor, insertVendorSchema, insertBudgetItemSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { WeddingProfile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const vendorFormSchema = insertVendorSchema.extend({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  contractUrl: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.number().min(0, "Total price must be positive").optional(),
  securityDeposit: z.number().min(0, "Security deposit must be positive").optional(),
  paidBy: z.string().optional(),
  weddingProfileId: z.number().optional(),
});

type VendorFormData = z.infer<typeof vendorFormSchema>;

const vendorCategories = [
  { value: 'venue', label: 'Venue & Location' },
  { value: 'planning', label: 'Planning & Coordination' },
  { value: 'catering', label: 'Catering & Food' },
  { value: 'photography', label: 'Photography & Videography' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'flowers', label: 'Flowers & Decoration' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'attire', label: 'Attire & Fashion' },
  { value: 'makeup', label: 'Makeup & Beauty' },
  { value: 'invitations', label: 'Invitations & Stationery' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'priest', label: 'Priest & Religious Services' },
  { value: 'other', label: 'Other' },
];



interface VendorsProps {
  weddingProfile: WeddingProfile;
}

export default function Vendors({ weddingProfile }: VendorsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors', weddingProfile?.id],
    queryFn: () => 
      weddingProfile 
        ? fetch(`/api/vendors?weddingProfileId=${weddingProfile.id}`, {
            credentials: 'include',
          }).then(res => res.json())
        : Promise.resolve([]),
    enabled: !!weddingProfile,
  });

  const getPaymentOptions = () => {
    if (!weddingProfile) return [];
    
    const brideLastName = weddingProfile?.brideName?.split(' ').pop() || 'Bride';
    const groomLastName = weddingProfile?.groomName?.split(' ').pop() || 'Groom';
    
    return [
      { value: 'bride', label: `${brideLastName}` },
      { value: 'groom', label: `${groomLastName}` },
    ];
  };

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      if (!weddingProfile) {
        throw new Error('Wedding profile not found');
      }
      
      // Create vendor
      const vendorResponse = await apiRequest('POST', '/api/vendors', {
        ...data,
        weddingProfileId: weddingProfile.id,
      });
      const vendor = await vendorResponse.json();
      
      // Create corresponding budget item if vendor has a total price
      if (data.totalPrice && data.totalPrice > 0) {
        try {
          const budgetItemData = {
            category: data.category,
            vendor: data.name,
            description: data.notes || `Budget item for ${data.name}`,
            estimatedAmount: data.totalPrice,
            paidAmount: data.securityDeposit || 0,
            status: data.securityDeposit && data.securityDeposit >= data.totalPrice ? 'paid' : 
                    data.securityDeposit && data.securityDeposit > 0 ? 'partial' : 'pending',
            paidBy: data.paidBy || undefined,
            weddingProfileId: weddingProfile.id,
          };
          
          await apiRequest('POST', '/api/budget', budgetItemData);
        } catch (error) {
          console.error('Failed to create budget item for vendor:', error);
          // Don't fail the vendor creation if budget item creation fails
        }
      }
      
      return vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', weddingProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget', weddingProfile?.id] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Vendor added successfully!",
        description: "Vendor has been added to both vendors and budget tabs.",
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Vendor> }) => {
      const response = await apiRequest('PUT', `/api/vendors/${id}`, data);
      const updatedVendor = await response.json();
      
      // Update corresponding budget item if vendor has a total price
      if (data.totalPrice && data.totalPrice > 0) {
        try {
          // Find the budget item for this vendor
          const budgetResponse = await apiRequest('GET', `/api/budget?weddingProfileId=${weddingProfile?.id}`);
          const budgetItems = await budgetResponse.json();
          const budgetItem = budgetItems.find((item: any) => item.vendor === data.name || item.vendor === updatedVendor.name);
          
          if (budgetItem) {
            const budgetUpdateData = {
              category: data.category || budgetItem.category,
              vendor: data.name || budgetItem.vendor,
              description: data.notes || budgetItem.description,
              estimatedAmount: data.totalPrice,
              paidAmount: data.securityDeposit || 0,
              status: data.securityDeposit && data.securityDeposit >= data.totalPrice ? 'paid' : 
                      data.securityDeposit && data.securityDeposit > 0 ? 'partial' : 'pending',
              paidBy: data.paidBy || budgetItem.paidBy,
            };
            
            await apiRequest('PUT', `/api/budget/${budgetItem.id}`, budgetUpdateData);
          }
        } catch (error) {
          console.error('Failed to update budget item for vendor:', error);
          // Don't fail the vendor update if budget item update fails
        }
      }
      
      return updatedVendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', weddingProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget', weddingProfile?.id] });
      setIsAddDialogOpen(false);
      setEditingVendor(null);
      form.reset();
      toast({
        title: "Vendor updated successfully!",
        description: "Vendor and budget information have been updated.",
      });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', weddingProfile?.id] });
    },
  });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      category: 'venue',
      contact: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      contractUrl: '',
      notes: '',
      totalPrice: undefined,
      securityDeposit: undefined,
      paidBy: '',
      weddingProfileId: weddingProfile?.id || 0,
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    if (editingVendor) {
      updateVendorMutation.mutate({ id: editingVendor.id, data });
    } else {
      createVendorMutation.mutate(data);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsAddDialogOpen(true);
    form.reset({
      name: vendor.name,
      category: vendor.category,
      contact: vendor.contact || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      website: vendor.website || '',
      contractUrl: vendor.contractUrl || '',
      notes: vendor.notes || '',
      totalPrice: vendor.totalPrice || undefined,
      securityDeposit: vendor.securityDeposit || undefined,
      paidBy: vendor.paidBy || '',
      weddingProfileId: weddingProfile?.id || 0,
    });
  };

  const handleDelete = (vendor: Vendor) => {
    setVendorToDelete(vendor);
  };

  const confirmDelete = () => {
    if (vendorToDelete) {
      deleteVendorMutation.mutate(vendorToDelete.id);
      setVendorToDelete(null);
    }
  };



  const getCategoryLabel = (category: string) => {
    return vendorCategories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      venue: 'bg-blue-50 text-blue-700 border-blue-200',
      planning: 'bg-purple-50 text-purple-700 border-purple-200',
      catering: 'bg-orange-50 text-orange-700 border-orange-200',
      photography: 'bg-pink-50 text-pink-700 border-pink-200',
      music: 'bg-green-50 text-green-700 border-green-200',
      flowers: 'bg-rose-50 text-rose-700 border-rose-200',
      transportation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      attire: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      makeup: 'bg-teal-50 text-teal-700 border-teal-200',
      invitations: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      jewelry: 'bg-amber-50 text-amber-700 border-amber-200',
      priest: 'bg-slate-50 text-slate-700 border-slate-200',
      other: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const handleContractClick = (contractUrl: string) => {
    if (contractUrl.startsWith('http')) {
      window.open(contractUrl, '_blank');
    }
  };

  const paymentOptions = getPaymentOptions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="wedding-card p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Vendors
              </h1>
              <p className="text-lg text-neutral-600 mb-4">
                Manage your wedding vendors
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingVendor(null);
                      form.reset();
                    }}
                    className="btn-wedding-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-rose-800">
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter vendor name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vendorCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
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
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact person name" {...field} />
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
                            <Input placeholder="Phone number" {...field} />
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
                            <Input placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="Website URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="securityDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Deposit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paidBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paid By</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select who paid" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Contract URL or link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
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
                        setEditingVendor(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                    >
                      {editingVendor ? 'Update' : 'Add'} Vendor
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg">
          <CardHeader className="border-b border-rose-100">
            <CardTitle className="text-rose-800 flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Vendor Directory</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-rose-50/50">
                    <TableHead className="text-rose-700 font-semibold">Name</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Category</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Contact</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Phone</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Email</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Total Price</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Deposit</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Paid By</TableHead>

                    <TableHead className="text-rose-700 font-semibold">Contract</TableHead>
                    <TableHead className="text-rose-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <Building2 className="w-12 h-12 text-rose-300" />
                          <div>
                            <p className="text-lg font-medium text-rose-600">No vendors yet</p>
                            <p className="text-rose-500">Add your first vendor to get started</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (Array.isArray(vendors) ? vendors : []).map((vendor) => {
                      return (
                        <TableRow key={vendor.id} className="hover:bg-rose-50/30 transition-colors">
                          <TableCell className="font-medium text-rose-800">{vendor.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getCategoryColor(vendor.category)}>
                              {getCategoryLabel(vendor.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-rose-700">{vendor.contact || '-'}</TableCell>
                          <TableCell>
                            {vendor.phone ? (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-700">{vendor.phone}</span>
                              </div>
                            ) : (
                              <span className="text-rose-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vendor.email ? (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4 text-rose-400" />
                                <span className="text-rose-700">{vendor.email}</span>
                              </div>
                            ) : (
                              <span className="text-rose-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vendor.totalPrice ? (
                              <span className="font-medium text-emerald-600">
                                ${vendor.totalPrice.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-rose-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vendor.securityDeposit ? (
                              <span className="font-medium text-blue-600">
                                ${vendor.securityDeposit.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-rose-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vendor.paidBy ? (
                              <Badge variant="outline" className="text-xs border-rose-200 text-rose-700 bg-rose-50">
                                {paymentOptions.find(p => p.value === vendor.paidBy)?.label || vendor.paidBy}
                              </Badge>
                            ) : (
                              <span className="text-rose-400">-</span>
                            )}
                          </TableCell>

                          <TableCell>
                            {vendor.contractUrl ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleContractClick(vendor.contractUrl!)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                title={`View contract: ${vendor.contractUrl}`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-rose-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(vendor)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(vendor)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationModal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        description="Are you sure you want to delete this vendor? This action cannot be undone."
        itemName={vendorToDelete?.name}
        itemDetails={vendorToDelete ? `${getCategoryLabel(vendorToDelete.category)} • ${vendorToDelete.contact || 'No contact'}` : undefined}
        itemIcon={<Building2 className="w-5 h-5 text-red-600" />}
        confirmText="Delete Vendor"
      />
    </div>
    </div>
  );
}