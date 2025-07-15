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
import { Plus, Edit, Trash2, Upload, ExternalLink, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Vendor, insertVendorSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

const vendorFormSchema = insertVendorSchema.extend({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
});

type VendorFormData = z.infer<typeof vendorFormSchema>;

const vendorCategories = [
  { value: 'venue', label: 'Venue & Location' },
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
  { value: 'other', label: 'Other Services' },
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  { value: 'booked', label: 'Booked', color: 'bg-purple-100 text-purple-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
];

export default function Vendors() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      const response = await apiRequest('POST', '/api/vendors', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setIsAddDialogOpen(false);
      form.reset();
      setContractFile(null);
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Vendor> }) => {
      const response = await apiRequest('PUT', `/api/vendors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      setEditingVendor(null);
      setContractFile(null);
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
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
      status: 'active',
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    // If there's a contract file, we would upload it here
    // For now, we'll just use the contractUrl field
    let finalData = { ...data };
    
    if (contractFile) {
      // In a real app, you would upload the file to a storage service
      // and get back a URL to store in contractUrl
      finalData.contractUrl = `contracts/${contractFile.name}`;
    }

    if (editingVendor) {
      updateVendorMutation.mutate({ id: editingVendor.id, data: finalData });
    } else {
      createVendorMutation.mutate(finalData);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
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
      status: vendor.status,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteVendorMutation.mutate(id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractFile(file);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const cat = vendorCategories.find(c => c.value === category);
    return cat?.label || category;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading vendors...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Vendor Management</h2>
            <p className="text-neutral-600">Manage wedding vendors and their contracts</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isAddDialogOpen || !!editingVendor} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingVendor(null);
                form.reset();
                setContractFile(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vendor Name</FormLabel>
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
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contact person" {...field} />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter website URL" {...field} />
                            </FormControl>
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
                            <Textarea placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contract Upload</label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="text-sm"
                          />
                          {contractFile && (
                            <span className="text-sm text-green-600">
                              {contractFile.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any additional notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingVendor(null);
                        form.reset();
                        setContractFile(null);
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createVendorMutation.isPending || updateVendorMutation.isPending}>
                        {editingVendor ? 'Update' : 'Add'} Vendor
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
      <div className="p-6 space-y-6">
        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(vendor.category)}</Badge>
                      </TableCell>
                      <TableCell>{vendor.contact || '-'}</TableCell>
                      <TableCell>
                        {vendor.phone ? (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4 text-neutral-400" />
                            <span>{vendor.phone}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {vendor.email ? (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4 text-neutral-400" />
                            <span>{vendor.email}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vendor.status)}>
                          {statusOptions.find(s => s.value === vendor.status)?.label || vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vendor.contractUrl ? (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-neutral-400">No contract</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(vendor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vendor.id)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}