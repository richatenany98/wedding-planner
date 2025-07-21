import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Upload, Plus, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Guest, WeddingProfile } from '@shared/schema';
import { z } from 'zod';

const bulkAddFormSchema = z.object({
  guestList: z.string().min(1, 'Guest list is required'),
  side: z.string().min(1, 'Side is required'),
  rsvpStatus: z.string().min(1, 'RSVP status is required'),
});

type BulkAddFormData = z.infer<typeof bulkAddFormSchema>;

export function GuestImport() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get wedding profile to use bride and groom names for sides
  const { data: weddingProfile } = useQuery<WeddingProfile>({
    queryKey: ['/api/wedding-profile'],
  });

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const bulkAddMutation = useMutation({
    mutationFn: async (data: BulkAddFormData) => {
      if (!weddingProfile) {
        throw new Error('Wedding profile not found');
      }

      const lines = data.guestList.split('\n').filter(line => line.trim());
      const guests = lines.map(line => {
        const parts = line.split(',');
        const name = parts[0]?.trim();
        const email = parts[1]?.trim() || '';
        const phone = parts[2]?.trim() || '';
        
        return {
          name: name ? capitalizeWords(name) : '',
          email: email || undefined,
          phone: phone || undefined,
          side: data.side.charAt(0).toUpperCase() + data.side.slice(1).toLowerCase(),
          rsvpStatus: data.rsvpStatus.charAt(0).toUpperCase() + data.rsvpStatus.slice(1).toLowerCase(),
          weddingProfileId: weddingProfile.id,
        };
      });

      // Add guests one by one
      for (const guest of guests) {
        if (guest.name) {
          await apiRequest('POST', '/api/guests', guest);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      setIsBulkAddDialogOpen(false);
      bulkForm.reset();
    },
  });

  // Get the bride's last name as default side
  const getDefaultSide = () => {
    if (!weddingProfile) return "";
    const brideLastName = weddingProfile.brideName.split(' ').pop() || "";
    return brideLastName;
  };

  const bulkForm = useForm<BulkAddFormData>({
    defaultValues: {
      guestList: '',
      side: getDefaultSide(),
      rsvpStatus: 'confirmed',
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        bulkForm.setValue('guestList', content);
      };
      reader.readAsText(file);
    }
  };

  const onBulkSubmit = (data: BulkAddFormData) => {
    bulkAddMutation.mutate(data);
  };

  return (
    <div className="flex space-x-2">
      {/* CSV/File Import */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import File
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Guests from File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload CSV or Text File</label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="mb-2"
              />
              <p className="text-sm text-neutral-600">
                Format: Name, Email, Phone (one per line)
              </p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Example format:</h4>
              <pre className="text-sm text-neutral-700">
                {`Rahul Kumar, rahul@email.com, 9876543210
Priya Sharma, priya@email.com, 9876543211
Amit Patel, amit@email.com, 9876543212`}
              </pre>
            </div>
            <Button onClick={() => setIsImportDialogOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Guests</DialogTitle>
          </DialogHeader>
          <Form {...bulkForm}>
            <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4">
              <FormField
                control={bulkForm.control}
                name="guestList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest List</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter guest names (one per line)&#10;Format: Name, Email, Phone&#10;Example:&#10;Rahul Kumar, rahul@email.com, 9876543210&#10;Priya Sharma&#10;Amit Patel, amit@email.com"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bulkForm.control}
                  name="side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select side" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weddingProfile && (
                            <>
                              <SelectItem value={weddingProfile.brideName.split(' ').pop() || ""}>
                                {weddingProfile.brideName.split(' ').pop()}
                              </SelectItem>
                              <SelectItem value={weddingProfile.groomName.split(' ').pop() || ""}>
                                {weddingProfile.groomName.split(' ').pop()}
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
                  control={bulkForm.control}
                  name="rsvpStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RSVP Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
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
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsBulkAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={bulkAddMutation.isPending}>
                  Add Guests
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}