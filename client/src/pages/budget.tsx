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
import { Plus, Edit, Trash2, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetItem, insertBudgetItemSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

const budgetFormSchema = insertBudgetItemSchema.extend({
  estimatedAmount: z.number().min(0, 'Amount must be positive'),
  actualAmount: z.number().min(0, 'Amount must be positive').optional(),
  paidAmount: z.number().min(0, 'Amount must be positive').optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

const budgetCategories = [
  { value: 'venue', label: 'Venue & Decoration' },
  { value: 'catering', label: 'Catering & Food' },
  { value: 'photography', label: 'Photography & Videography' },
  { value: 'attire', label: 'Attire & Jewelry' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'invitations', label: 'Invitations & Stationery' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'flowers', label: 'Flowers & Garlands' },
  { value: 'priest', label: 'Priest & Ceremonies' },
  { value: 'gifts', label: 'Gifts & Favors' },
  { value: 'makeup', label: 'Makeup & Beauty' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'partial', label: 'Partial Payment', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function Budget() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const queryClient = useQueryClient();

  const { data: budgetItems = [], isLoading } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget'],
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiRequest('POST', '/api/budget', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setEditingBudgetItem(null);
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
      description: '',
      estimatedAmount: 0,
      actualAmount: 0,
      paidAmount: 0,
      status: 'pending',
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    if (editingBudgetItem) {
      updateBudgetMutation.mutate({ id: editingBudgetItem.id, data });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  const handleEdit = (budgetItem: BudgetItem) => {
    setEditingBudgetItem(budgetItem);
    form.reset({
      category: budgetItem.category,
      vendor: budgetItem.vendor,
      description: budgetItem.description || '',
      estimatedAmount: budgetItem.estimatedAmount,
      actualAmount: budgetItem.actualAmount || 0,
      paidAmount: budgetItem.paidAmount || 0,
      status: budgetItem.status,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this budget item?')) {
      deleteBudgetMutation.mutate(id);
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

  // Calculate totals
  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  const totalPaid = budgetItems.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
  const remaining = totalActual - totalPaid;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading budget...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Budget Management</h2>
            <p className="text-neutral-600">Track wedding expenses and vendor payments</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isAddDialogOpen || !!editingBudgetItem} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingBudgetItem(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingBudgetItem ? 'Edit Budget Item' : 'Add New Budget Item'}</DialogTitle>
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter description (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="estimatedAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Amount</FormLabel>
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
                        name="actualAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Actual Amount</FormLabel>
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
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingBudgetItem(null);
                        form.reset();
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingBudgetItem ? 'Update' : 'Add'} Budget Item
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
        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Estimated</p>
                  <p className="text-2xl font-bold text-neutral-800">{formatCurrency(totalEstimated)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="text-blue-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Actual</p>
                  <p className="text-2xl font-bold text-neutral-800">{formatCurrency(totalActual)}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="text-green-600" size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Remaining</p>
                  <p className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(remaining))}
                  </p>
                </div>
                <div className={`w-10 h-10 ${remaining > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                  {remaining > 0 ? 
                    <TrendingDown className="text-red-600" size={20} /> : 
                    <TrendingUp className="text-green-600" size={20} />
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Estimated</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.vendor}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell>{formatCurrency(item.estimatedAmount)}</TableCell>
                      <TableCell>{formatCurrency(item.actualAmount || 0)}</TableCell>
                      <TableCell>{formatCurrency(item.paidAmount || 0)}</TableCell>
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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