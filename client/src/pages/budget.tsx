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
import { Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetItem, insertBudgetItemSchema, Vendor } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { WeddingProfile } from '@shared/schema';

const budgetFormSchema = insertBudgetItemSchema.extend({
  category: z.string().min(1, "Category is required"),
  vendor: z.string().min(1, "Vendor is required"),
  estimatedAmount: z.number().min(0, "Total amount must be positive"),
  paidAmount: z.number().min(0, "Paid amount must be positive").optional(),
  status: z.string().min(1, "Status is required"),
  paidBy: z.string().optional(),
  eventId: z.number().optional(),
  weddingProfileId: z.number().optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

const budgetCategories = [
  { value: 'venue', label: 'Venue & Decoration', color: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200' },
  { value: 'catering', label: 'Catering & Food', color: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200' },
  { value: 'photography', label: 'Photography & Videography', color: 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200' },
  { value: 'attire', label: 'Attire & Jewelry', color: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200' },
  { value: 'music', label: 'Music & Entertainment', color: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200' },
  { value: 'invitations', label: 'Invitations & Stationery', color: 'bg-gradient-to-r from-cyan-100 to-sky-100 text-cyan-800 border-cyan-200' },
  { value: 'transportation', label: 'Transportation', color: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200' },
  { value: 'flowers', label: 'Flowers & Garlands', color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' },
  { value: 'priest', label: 'Priest & Ceremonies', color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' },
  { value: 'gifts', label: 'Gifts & Favors', color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200' },
  { value: 'makeup', label: 'Makeup & Beauty', color: 'bg-gradient-to-r from-fuchsia-100 to-purple-100 text-fuchsia-800 border-fuchsia-200' },
  { value: 'planning', label: 'Planning & Coordination', color: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200' },
  { value: 'miscellaneous', label: 'Miscellaneous', color: 'bg-gradient-to-r from-neutral-100 to-stone-100 text-neutral-800 border-neutral-200' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200' },
  { value: 'paid', label: 'Paid', color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' },
  { value: 'partial', label: 'Partial Payment', color: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200' },
];

const paymentOptions = [
  { value: 'bride', label: 'Bride\'s Family' },
  { value: 'groom', label: 'Groom\'s Family' },
];

interface BudgetProps {
  weddingProfile: WeddingProfile;
}

export default function Budget({ weddingProfile }: BudgetProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);
  const queryClient = useQueryClient();

  const { data: budgetItems = [], isLoading: budgetLoading } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget', weddingProfile?.id],
    queryFn: () => 
      weddingProfile 
        ? fetch(`/api/budget?weddingProfileId=${weddingProfile.id}`, {
            credentials: 'include',
          }).then(res => res.json())
        : Promise.resolve([]),
    enabled: !!weddingProfile,
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors', weddingProfile?.id],
    queryFn: () => 
      weddingProfile 
        ? fetch(`/api/vendors?weddingProfileId=${weddingProfile.id}`, {
            credentials: 'include',
          }).then(res => res.json())
        : Promise.resolve([]),
    enabled: !!weddingProfile,
  });

  const createBudgetItemMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      if (!weddingProfile) {
        throw new Error('Wedding profile not found');
      }
      const response = await apiRequest('POST', '/api/budget', {
        ...data,
        weddingProfileId: weddingProfile.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget', weddingProfile?.id] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BudgetItem> }) => {
      const response = await apiRequest('PUT', `/api/budget/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget', weddingProfile?.id] });
      setEditingItem(null);
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/budget/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
    },
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: 'venue',
      vendor: '',
      estimatedAmount: 0,
      paidAmount: 0,
      status: 'pending',
      paidBy: '',
      weddingProfileId: weddingProfile?.id || 0,
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    if (editingItem) {
      updateBudgetMutation.mutate({ id: editingItem.id, data });
    } else {
      createBudgetItemMutation.mutate(data);
    }
  };

  const handleEdit = (budgetItem: BudgetItem) => {
    setEditingItem(budgetItem);
    setIsAddDialogOpen(true);
    form.reset({
      category: budgetItem.category,
      vendor: budgetItem.vendor,
      estimatedAmount: budgetItem.estimatedAmount,
      paidAmount: budgetItem.paidAmount || 0,
      status: budgetItem.status,
      paidBy: budgetItem.paidBy || '',
      weddingProfileId: budgetItem.weddingProfileId || undefined,
    });
  };

  const handleDelete = (budgetItem: BudgetItem) => {
    setItemToDelete(budgetItem);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteBudgetMutation.mutate(itemToDelete.id);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const cat = budgetCategories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const cat = budgetCategories.find(c => c.value === category);
    return cat?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Sync budget items with vendor deposits
  const syncedBudgetItems = (Array.isArray(budgetItems) ? budgetItems : []).map(budgetItem => {
    const matchingVendor = vendors.find(vendor => vendor.name === budgetItem.vendor);
    const depositAmount = matchingVendor?.securityDeposit || 0;
    
    return {
      ...budgetItem,
      paidAmount: depositAmount,
      // Update status based on deposit vs total
      status: depositAmount >= budgetItem.estimatedAmount ? 'paid' : 
              depositAmount > 0 ? 'partial' : 'pending'
    };
  });

  // Calculate totals using synced data
  const totalBudget = syncedBudgetItems.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const totalPaid = syncedBudgetItems.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const remaining = totalBudget - totalPaid;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (budgetLoading || vendorsLoading) {
    return <div className="flex justify-center p-8">Loading budget...</div>;
  }

  // Get bride and groom last names for payment options
  const getPaymentOptions = () => {
    const brideLastName = weddingProfile?.brideName?.split(' ').pop() || 'Bride';
    const groomLastName = weddingProfile?.groomName?.split(' ').pop() || 'Groom';
    
    return [
      { value: 'bride', label: brideLastName },
      { value: 'groom', label: groomLastName },
    ];
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="wedding-card p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-16 h-16 wedding-gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="text-white" size={28} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 wedding-gradient-gold rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={12} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Budget Management
                </h1>
                <p className="text-lg text-neutral-600">
                  Track wedding expenses and vendor payments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddDialogOpen || !!editingItem} onOpenChange={(open) => {
                if (!open) {
                  setIsAddDialogOpen(false);
                  setEditingItem(null);
                  form.reset();
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setIsAddDialogOpen(true);
                      setEditingItem(null);
                      form.reset();
                    }}
                    className="btn-wedding-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Budget Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                                  {budgetCategories.map((category) => (
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
                          name="vendor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vendor name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                  
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="estimatedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="paidAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Paid Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                        <FormField
                          control={form.control}
                          name="paidBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Paid By</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select who's paying" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getPaymentOptions().map((option) => (
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
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                          setIsAddDialogOpen(false);
                          setEditingItem(null);
                          form.reset();
                        }}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="btn-wedding-primary"
                          disabled={createBudgetItemMutation.isPending || updateBudgetMutation.isPending}
                        >
                          {editingItem ? 'Update' : 'Add'} Budget Item
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Budget Summary */}
        <div className="wedding-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <p className="text-sm text-neutral-600 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <p className="text-sm text-neutral-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className={`text-center p-4 rounded-xl border ${
              remaining > 0 
                ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                remaining > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {remaining > 0 ? 
                  <TrendingDown className="text-red-600" size={24} /> : 
                  <TrendingUp className="text-green-600" size={24} />
                }
              </div>
              <p className="text-sm text-neutral-600 mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>

        {/* Family Payment Summary */}
        <div className="wedding-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="text-pink-600" size={24} />
              </div>
              <p className="text-sm text-neutral-600 mb-1">{weddingProfile?.brideName?.split(' ').pop() || 'Bride'} Family</p>
              <p className="text-2xl font-bold text-pink-600">
                {formatCurrency(budgetItems
                  .filter(item => item.paidBy === 'bride')
                  .reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
                )}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <p className="text-sm text-neutral-600 mb-1">{weddingProfile?.groomName?.split(' ').pop() || 'Groom'} Family</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetItems
                  .filter(item => item.paidBy === 'groom')
                  .reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Items Table */}
        <div className="wedding-card">
          <CardHeader className="border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 wedding-gradient-pink rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-800">
                Budget Items
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/50">
                  <TableHead className="font-semibold text-neutral-700">Vendor</TableHead>
                  <TableHead className="font-semibold text-neutral-700">Category</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Total</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Paid</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Remaining</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Paid By</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Status</TableHead>
                    <TableHead className="font-semibold text-neutral-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedBudgetItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-white/30 transition-colors">
                      <TableCell className="font-medium text-neutral-800">{item.vendor}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">{formatCurrency(item.estimatedAmount)}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(item.paidAmount || 0)}</TableCell>
                      <TableCell className={`font-semibold ${(item.estimatedAmount || 0) - (item.paidAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency((item.estimatedAmount || 0) - (item.paidAmount || 0))}
                      </TableCell>
                      <TableCell>
                        {item.paidBy ? (
                          <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200">
                            {getPaymentOptions().find(p => p.value === item.paidBy)?.label || item.paidBy}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {statusOptions.find(s => s.value === item.status)?.label || item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-white/50"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="hover:bg-white/50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Budget Item"
        description="Are you sure you want to delete this budget item? This action cannot be undone."
        itemName={itemToDelete?.vendor}
        itemDetails={itemToDelete ? `${getCategoryLabel(itemToDelete.category)} • ${formatCurrency(itemToDelete.estimatedAmount)}` : undefined}
        itemIcon={<DollarSign className="w-5 h-5 text-red-600" />}
        confirmText="Delete Budget Item"
      />
    </div>
  );
}