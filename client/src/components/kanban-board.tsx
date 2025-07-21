import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MoreVertical, Edit, Trash2, CheckSquare, Search, CheckCircle, ChevronDown, Calendar, Users, Clock, Target, TrendingUp, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import { Task, insertTaskSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { WeddingProfile } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  assignedTo: z.string().min(1, "Assigned to is required"),
  dueDate: z.string().optional(),
  eventId: z.number().optional(),
  weddingProfileId: z.number().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const columns = [
  { 
    id: 'todo', 
    title: 'To Do', 
    color: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
    icon: Target,
    textColor: 'text-rose-700',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  { 
    id: 'inprogress', 
    title: 'In Progress', 
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
    icon: PlayCircle,
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  { 
    id: 'done', 
    title: 'Done', 
    color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    icon: CheckCircle2,
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
];

const categories = [
  { value: 'venue', label: 'Venue & Location', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏛️' },
  { value: 'decor', label: 'Decor & Styling', color: 'bg-green-50 text-green-700 border-green-200', icon: '🌸' },
  { value: 'food', label: 'Food & Catering', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🍽️' },
  { value: 'attire', label: 'Attire & Fashion', color: 'bg-red-50 text-red-700 border-red-200', icon: '👗' },
  { value: 'invitations', label: 'Invitations & Stationery', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '✉️' },
  { value: 'photography', label: 'Photography & Videography', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '📸' },
  { value: 'music', label: 'Music & Entertainment', color: 'bg-pink-50 text-pink-700 border-pink-200', icon: '🎵' },
  { value: 'ceremonies', label: 'Ceremonies & Traditions', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🕉️' },
  { value: 'planning', label: 'Planning & Coordination', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: '📋' },
  { value: 'legal', label: 'Legal & Documentation', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: '📄' },
  { value: 'gifts', label: 'Gifts & Favors', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '🎁' },
  { value: 'beauty', label: 'Beauty & Wellness', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '💄' },
  { value: 'travel', label: 'Travel & Honeymoon', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✈️' },
  { value: 'miscellaneous', label: 'Miscellaneous', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: '🔧' },
];

const predefinedTasks = [
  // Venue & Location Tasks
  { title: 'Book wedding venue', category: 'venue', description: 'Reserve main ceremony venue' },
  { title: 'Book reception venue', category: 'venue', description: 'Reserve reception hall' },
  { title: 'Visit venue for final checks', category: 'venue', description: 'Final venue inspection' },
  { title: 'Book mandap/altar setup', category: 'venue', description: 'Arrange ceremonial setup' },
  { title: 'Book accommodation for guests', category: 'venue', description: 'Reserve hotel blocks' },
  { title: 'Arrange transportation for guests', category: 'venue', description: 'Book shuttles/transport' },
  
  // Decor & Styling Tasks
  { title: 'Choose mandap design', category: 'decor', description: 'Select mandap decoration style' },
  { title: 'Book decorator', category: 'decor', description: 'Hire decoration service' },
  { title: 'Choose flowers for ceremonies', category: 'decor', description: 'Select flower arrangements' },
  { title: 'Plan entrance decoration', category: 'decor', description: 'Design entrance decor' },
  { title: 'Choose table centerpieces', category: 'decor', description: 'Select table decorations' },
  { title: 'Book lighting setup', category: 'decor', description: 'Arrange lighting design' },
  { title: 'Choose color scheme', category: 'decor', description: 'Finalize wedding colors' },
  { title: 'Book backdrop/photo booth', category: 'decor', description: 'Arrange photo areas' },
  
  // Food & Catering Tasks
  { title: 'Book catering service', category: 'food', description: 'Hire catering company' },
  { title: 'Finalize menu', category: 'food', description: 'Confirm all meal options' },
  { title: 'Arrange for special dietary needs', category: 'food', description: 'Accommodate dietary restrictions' },
  { title: 'Book sweet vendor', category: 'food', description: 'Arrange traditional sweets' },
  { title: 'Book dessert vendor', category: 'food', description: 'Arrange wedding cake/desserts' },
  { title: 'Plan cocktail hour menu', category: 'food', description: 'Design appetizer selection' },
  { title: 'Book bartending service', category: 'food', description: 'Arrange drink service' },
  { title: 'Choose wedding cake design', category: 'food', description: 'Design cake style' },
  
  // Attire & Fashion Tasks
  { title: 'Shop for bridal lehenga', category: 'attire', description: 'Purchase bridal outfit' },
  { title: 'Shop for groom\'s sherwani', category: 'attire', description: 'Purchase groom\'s outfit' },
  { title: 'Buy jewelry for bride', category: 'attire', description: 'Purchase wedding jewelry' },
  { title: 'Final fittings', category: 'attire', description: 'Complete outfit fittings' },
  { title: 'Shop for bridesmaid dresses', category: 'attire', description: 'Choose bridal party outfits' },
  { title: 'Shop for groomsmen attire', category: 'attire', description: 'Choose groom\'s party outfits' },
  { title: 'Book makeup artist', category: 'attire', description: 'Hire bridal makeup service' },
  { title: 'Book hair stylist', category: 'attire', description: 'Arrange hair styling' },
  { title: 'Book groom\'s grooming', category: 'attire', description: 'Arrange groom\'s styling' },
  { title: 'Choose wedding shoes', category: 'attire', description: 'Select footwear for ceremony' },
  { title: 'Plan jewelry for ceremonies', category: 'attire', description: 'Organize ceremonial jewelry' },
  
  // Invitations & Stationery Tasks
  { title: 'Design wedding invitations', category: 'invitations', description: 'Create invitation design' },
  { title: 'Print invitations', category: 'invitations', description: 'Print physical invitations' },
  { title: 'Send invitations', category: 'invitations', description: 'Distribute invitations to guests' },
  { title: 'Design wedding website', category: 'invitations', description: 'Create online wedding info' },
  { title: 'Create RSVP system', category: 'invitations', description: 'Set up response tracking' },
  { title: 'Design ceremony programs', category: 'invitations', description: 'Create ceremony booklets' },
  { title: 'Design reception menus', category: 'invitations', description: 'Create table menus' },
  { title: 'Design place cards', category: 'invitations', description: 'Create seating cards' },
  { title: 'Design thank you cards', category: 'invitations', description: 'Create post-wedding cards' },
  
  // Photography & Videography Tasks
  { title: 'Book wedding photographer', category: 'photography', description: 'Hire photographer service' },
  { title: 'Book videographer', category: 'photography', description: 'Hire videography service' },
  { title: 'Plan pre-wedding shoot', category: 'photography', description: 'Schedule engagement photos' },
  { title: 'Finalize shot list', category: 'photography', description: 'Create photography checklist' },
  { title: 'Book drone photography', category: 'photography', description: 'Arrange aerial shots' },
  { title: 'Plan family photo list', category: 'photography', description: 'Organize family groupings' },
  { title: 'Book photo booth', category: 'photography', description: 'Arrange guest photo area' },
  { title: 'Choose wedding album design', category: 'photography', description: 'Design photo album' },
  
  // Music & Entertainment Tasks
  { title: 'Book live band/DJ', category: 'music', description: 'Hire entertainment service' },
  { title: 'Choose ceremony music', category: 'music', description: 'Select processional/recessional' },
  { title: 'Plan reception playlist', category: 'music', description: 'Create dance music list' },
  { title: 'Book traditional musicians', category: 'music', description: 'Arrange cultural music' },
  { title: 'Plan first dance song', category: 'music', description: 'Choose couple\'s dance music' },
  { title: 'Book sound system', category: 'music', description: 'Arrange audio equipment' },
  
  // Ceremonies & Traditions Tasks
  { title: 'Book priest/pandit', category: 'ceremonies', description: 'Hire religious officiant' },
  { title: 'Plan ceremony timeline', category: 'ceremonies', description: 'Schedule ceremony events' },
  { title: 'Choose wedding rituals', category: 'ceremonies', description: 'Select traditional ceremonies' },
  { title: 'Book mehndi artist', category: 'ceremonies', description: 'Arrange henna application' },
  { title: 'Plan sangeet program', category: 'ceremonies', description: 'Organize musical evening' },
  { title: 'Book baraat arrangements', category: 'ceremonies', description: 'Plan groom\'s procession' },
  { title: 'Plan haldi ceremony', category: 'ceremonies', description: 'Organize turmeric ceremony' },
  { title: 'Book grah shanti ceremony', category: 'ceremonies', description: 'Arrange pre-wedding prayers' },
  
  // Planning & Coordination Tasks
  { title: 'Hire wedding planner', category: 'planning', description: 'Book professional coordinator' },
  { title: 'Create wedding timeline', category: 'planning', description: 'Develop detailed schedule' },
  { title: 'Plan rehearsal dinner', category: 'planning', description: 'Organize pre-wedding meal' },
  { title: 'Book wedding insurance', category: 'planning', description: 'Purchase event coverage' },
  { title: 'Plan backup weather options', category: 'planning', description: 'Arrange indoor alternatives' },
  { title: 'Create emergency contact list', category: 'planning', description: 'Compile vendor contacts' },
  { title: 'Plan wedding day timeline', category: 'planning', description: 'Create minute-by-minute schedule' },
  { title: 'Book wedding day coordinator', category: 'planning', description: 'Hire day-of coordinator' },
  
  // Legal & Documentation Tasks
  { title: 'Apply for marriage license', category: 'legal', description: 'Obtain legal marriage permit' },
  { title: 'Book marriage registrar', category: 'legal', description: 'Arrange legal ceremony' },
  { title: 'Plan name change process', category: 'legal', description: 'Organize post-wedding changes' },
  { title: 'Update insurance policies', category: 'legal', description: 'Modify coverage after marriage' },
  { title: 'Plan prenup agreement', category: 'legal', description: 'Consider legal agreements' },
  
  // Gifts & Favors Tasks
  { title: 'Choose wedding favors', category: 'gifts', description: 'Select guest gifts' },
  { title: 'Plan bridal party gifts', category: 'gifts', description: 'Choose wedding party presents' },
  { title: 'Plan parent gifts', category: 'gifts', description: 'Select family presents' },
  { title: 'Create gift registry', category: 'gifts', description: 'Set up gift preferences' },
  { title: 'Plan honeymoon registry', category: 'gifts', description: 'Create travel fund' },
  { title: 'Choose ceremony gifts', category: 'gifts', description: 'Select traditional presents' },
  
  // Beauty & Wellness Tasks
  { title: 'Book spa treatments', category: 'beauty', description: 'Arrange pre-wedding pampering' },
  { title: 'Plan skincare routine', category: 'beauty', description: 'Develop beauty regimen' },
  { title: 'Book nail appointments', category: 'beauty', description: 'Arrange manicure/pedicure' },
  { title: 'Plan hair trials', category: 'beauty', description: 'Test hairstyle options' },
  { title: 'Book makeup trials', category: 'beauty', description: 'Test makeup looks' },
  { title: 'Plan fitness routine', category: 'beauty', description: 'Develop pre-wedding fitness' },
  
  // Travel & Honeymoon Tasks
  { title: 'Book honeymoon destination', category: 'travel', description: 'Choose post-wedding trip' },
  { title: 'Book honeymoon flights', category: 'travel', description: 'Arrange travel tickets' },
  { title: 'Book honeymoon accommodation', category: 'travel', description: 'Reserve hotel/resort' },
  { title: 'Plan honeymoon activities', category: 'travel', description: 'Organize trip itinerary' },
  { title: 'Apply for travel documents', category: 'travel', description: 'Obtain passports/visas' },
  { title: 'Book airport transfers', category: 'travel', description: 'Arrange transportation' },
  
  // Miscellaneous Tasks
  { title: 'Plan wedding hashtag', category: 'miscellaneous', description: 'Create social media tag' },
  { title: 'Book wedding day weather', category: 'miscellaneous', description: 'Check weather forecast' },
  { title: 'Plan wedding day emergency kit', category: 'miscellaneous', description: 'Prepare backup supplies' },
  { title: 'Choose wedding day perfume', category: 'miscellaneous', description: 'Select signature scent' },
  { title: 'Plan wedding day playlist', category: 'miscellaneous', description: 'Create personal music list' },
  { title: 'Book wedding day breakfast', category: 'miscellaneous', description: 'Arrange morning meal' },
];

const roles = [
  { value: 'bride', label: 'Bride', color: 'bg-pink-500' },
  { value: 'groom', label: 'Groom', color: 'bg-blue-500' },
  { value: 'planner', label: 'Planner', color: 'bg-purple-500' },
  { value: 'parents', label: 'Parents', color: 'bg-green-500' },
  { value: 'family', label: 'Family', color: 'bg-orange-500' },
];

interface KanbanBoardProps {
  weddingProfile: WeddingProfile;
}

export function KanbanBoard({ weddingProfile }: KanbanBoardProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPredefinedTasks, setShowPredefinedTasks] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [predefinedTaskSearch, setPredefinedTaskSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['venue', 'decor', 'food']); // Start with most common categories expanded
  const [selectedPredefinedTasks, setSelectedPredefinedTasks] = useState<typeof predefinedTasks>([]);
  const [isAddingTasks, setIsAddingTasks] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks', weddingProfile?.id],
    queryFn: async () => {
      if (!weddingProfile) return [];
      try {
        const response = await fetch(`/api/tasks?weddingProfileId=${weddingProfile.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
      }
    },
    enabled: !!weddingProfile,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!weddingProfile) {
        throw new Error('Wedding profile not found');
      }
      const response = await apiRequest('POST', '/api/tasks', {
        ...data,
        weddingProfileId: weddingProfile.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', weddingProfile?.id] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Task created successfully!",
        description: "Your new task has been added to the board.",
      });
    },
  });

  // Check if a predefined task already exists
  const isTaskAlreadyAdded = (predefinedTask: typeof predefinedTasks[0]) => {
    if (!Array.isArray(tasks)) return false;
    return tasks.some(task => 
      task.title.toLowerCase() === predefinedTask.title.toLowerCase() &&
      task.category === predefinedTask.category
    );
  };

  // Handle selecting/deselecting predefined tasks
  const handlePredefinedTaskToggle = (predefinedTask: typeof predefinedTasks[0]) => {
    if (isTaskAlreadyAdded(predefinedTask)) {
      toast({
        title: "Task already added",
        description: `"${predefinedTask.title}" is already in your task list.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedPredefinedTasks(prev => {
      const isSelected = prev.some(task => 
        task.title === predefinedTask.title && task.category === predefinedTask.category
      );
      
      if (isSelected) {
        return prev.filter(task => 
          !(task.title === predefinedTask.title && task.category === predefinedTask.category)
        );
      } else {
        return [...prev, predefinedTask];
      }
    });
  };

  // Handle adding all selected predefined tasks
  const handleAddSelectedTasks = async () => {
    if (selectedPredefinedTasks.length === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to add.",
        variant: "destructive",
      });
      return;
    }

    if (!weddingProfile) {
      toast({
        title: "Error",
        description: "Wedding profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingTasks(true);
    
    try {
      // Add tasks one by one
      for (const predefinedTask of selectedPredefinedTasks) {
        const taskData = {
          title: predefinedTask.title,
          description: predefinedTask.description,
          category: predefinedTask.category,
          status: 'todo',
          assignedTo: 'bride',
          dueDate: '',
          weddingProfileId: weddingProfile.id,
        };
        
        await apiRequest('POST', '/api/tasks', taskData);
      }

      // Show success message
      toast({
        title: "Tasks added successfully",
        description: `Added ${selectedPredefinedTasks.length} task${selectedPredefinedTasks.length > 1 ? 's' : ''} to your list.`,
      });

      // Reset and close dialog
      setSelectedPredefinedTasks([]);
      setShowPredefinedTasks(false);
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', weddingProfile.id] });
    } catch (error) {
      toast({
        title: "Error adding tasks",
        description: "Some tasks could not be added. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingTasks(false);
    }
  };

  // Close predefined tasks dialog and reset selection
  const handleClosePredefinedTasks = () => {
    setShowPredefinedTasks(false);
    setSelectedPredefinedTasks([]);
    setPredefinedTaskSearch("");
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      const response = await apiRequest('PUT', `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', weddingProfile?.id] });
      setEditingTask(null);
      toast({
        title: "Task updated successfully!",
        description: "Your task has been updated.",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', weddingProfile?.id] });
      toast({
        title: "Task deleted successfully!",
        description: "The task has been removed from your board.",
      });
    },
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'venue',
      status: 'todo',
      assignedTo: 'bride',
      dueDate: '',
      weddingProfileId: weddingProfile?.id || 0, // Ensure weddingProfileId is set
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      category: task.category,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate || '',
      weddingProfileId: weddingProfile?.id || 0, // Ensure weddingProfileId is set
    });
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };



  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-100 text-gray-800';
  };

  const getAssigneeInitials = (assignedTo: string) => {
    const initials = {
      bride: 'B',
      groom: 'G',
      planner: 'P',
      parents: 'F',
      family: 'F',
    };
    return initials[assignedTo as keyof typeof initials] || 'U';
  };

  const getAssigneeColor = (assignedTo: string) => {
    const colors = {
      bride: 'bg-pink-500',
      groom: 'bg-blue-500',
      planner: 'bg-primary',
      parents: 'bg-secondary',
      family: 'bg-green-500',
    };
    return colors[assignedTo as keyof typeof colors] || 'bg-gray-500';
  };

  // Filter predefined tasks based on search
  const filteredPredefinedTasks = predefinedTasks.filter(task =>
    task.title.toLowerCase().includes(predefinedTaskSearch.toLowerCase()) ||
    task.description.toLowerCase().includes(predefinedTaskSearch.toLowerCase()) ||
    categories.find(c => c.value === task.category)?.label.toLowerCase().includes(predefinedTaskSearch.toLowerCase())
  );

  // Group tasks by category
  const groupedTasks = categories.reduce((acc, category) => {
    const categoryTasks = filteredPredefinedTasks.filter(task => task.category === category.value);
    if (categoryTasks.length > 0) {
      acc[category.value] = categoryTasks;
    }
    return acc;
  }, {} as Record<string, typeof predefinedTasks>);

  // Toggle category expansion
  const toggleCategory = (categoryValue: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryValue) 
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load tasks</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks', weddingProfile?.id] })}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
    const userMatch = selectedUser === 'all' || task.assignedTo === selectedUser;
    return categoryMatch && userMatch;
  });

  // Calculate stats using filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'done').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'inprogress').length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border border-rose-200 rounded-lg px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Task Management
            </h2>
            <p className="text-rose-600 mt-1">Organize and track your wedding planning progress</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPredefinedTasks(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add from Templates
            </Button>
            <Dialog open={isAddDialogOpen || !!editingTask} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingTask(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-rose-800">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-rose-700 font-medium">Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} className="border-rose-200 focus:border-rose-400" />
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
                          <FormLabel className="text-rose-700 font-medium">Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter task description" {...field} className="border-rose-200 focus:border-rose-400" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-rose-700 font-medium">Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-rose-200 focus:border-rose-400">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    <div className="flex items-center space-x-2">
                                      <span>{category.icon}</span>
                                      <span>{category.label}</span>
                                    </div>
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
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-rose-700 font-medium">Assigned To</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-rose-200 focus:border-rose-400">
                                  <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                                      <span>{role.label}</span>
                                    </div>
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-rose-700 font-medium">Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-rose-200 focus:border-rose-400" />
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
                          setEditingTask(null);
                          form.reset();
                        }}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                      >
                        {editingTask ? 'Update' : 'Add'} Task
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border border-rose-200 rounded-lg px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-rose-700">Filters:</span>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-rose-600">Category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 border-rose-200 focus:border-rose-400">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-rose-600">Assigned to:</span>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-40 border-rose-200 focus:border-rose-400">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 ${role.color} rounded-full`}></div>
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== 'all' || selectedUser !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedUser('all');
              }}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">Total Tasks</p>
                <p className="text-2xl font-bold text-rose-800">{totalTasks}</p>
              </div>
              <div className="p-3 bg-rose-100 rounded-full">
                <Target className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">In Progress</p>
                <p className="text-2xl font-bold text-amber-800">{inProgressTasks}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <PlayCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Completed</p>
                <p className="text-2xl font-bold text-emerald-800">{completedTasks}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Progress</p>
                <p className="text-2xl font-bold text-purple-800">{completionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          const ColumnIcon = column.icon;
          
          return (
            <Card key={column.id} className={`${column.color} border shadow-lg hover:shadow-xl transition-all duration-200`}>
              <CardHeader className="border-b border-rose-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ColumnIcon className={`w-5 h-5 ${column.textColor}`} />
                    <CardTitle className={`text-lg font-semibold ${column.textColor}`}>
                      {column.title}
                    </CardTitle>
                  </div>
                  <Badge className={`${column.badgeColor} border font-medium`}>
                    {columnTasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <ColumnIcon className={`w-12 h-12 ${column.textColor} opacity-50 mx-auto mb-2`} />
                      <p className={`text-sm ${column.textColor} opacity-70`}>No tasks yet</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const category = categories.find(c => c.value === task.category);
                      const role = roles.find(r => r.value === task.assignedTo);
                      
                      return (
                        <Card key={task.id} className="bg-white/90 backdrop-blur-sm border border-rose-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={`${category?.color} border text-xs font-medium`}>
                                <span className="mr-1">{category?.icon}</span>
                                {category?.label}
                              </Badge>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(task)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(task)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <h5 className="font-medium text-rose-800 mb-2 line-clamp-2">{task.title}</h5>
                            
                            {task.description && (
                              <p className="text-sm text-rose-600 mb-3 line-clamp-2">{task.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 ${role?.color} rounded-full flex items-center justify-center`}>
                                  <span className="text-white text-xs font-medium">
                                    {getAssigneeInitials(task.assignedTo)}
                                  </span>
                                </div>
                                <span className="text-sm text-rose-700 capitalize font-medium">{task.assignedTo}</span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-rose-400" />
                                  <span className="text-xs text-rose-500 font-medium">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Status change buttons */}
                            <div className="flex justify-between pt-3 border-t border-rose-100">
                              {columns.map((col) => (
                                <Button
                                  key={col.id}
                                  variant={task.status === col.id ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(task.id, col.id)}
                                  className={`text-xs ${
                                    task.status === col.id 
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white' 
                                      : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                  }`}
                                >
                                  {col.title}
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Predefined Tasks Dialog */}
      <Dialog open={showPredefinedTasks} onOpenChange={handleClosePredefinedTasks}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Predefined Tasks</DialogTitle>
            <DialogDescription>
              Select tasks from our comprehensive wedding planning checklist. Tasks already in your list are disabled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={predefinedTaskSearch}
                  onChange={(e) => setPredefinedTaskSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Selected Tasks Summary */}
            {selectedPredefinedTasks.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedPredefinedTasks.length} task{selectedPredefinedTasks.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPredefinedTasks([])}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedTasks).map(([categoryValue, categoryTasks]) => {
                const category = categories.find(c => c.value === categoryValue);
                const isExpanded = expandedCategories.includes(categoryValue);
                
                return (
                  <div key={categoryValue} className="mb-4">
                    <button
                      onClick={() => toggleCategory(categoryValue)}
                      className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${category?.color || 'bg-gray-400'}`} />
                        <span className="font-medium">{category?.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {categoryTasks.length}
                        </Badge>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2 space-y-2 pl-4">
                        {categoryTasks.map((task, index) => {
                          const isAlreadyAdded = isTaskAlreadyAdded(task);
                          const isSelected = selectedPredefinedTasks.some(selected => 
                            selected.title === task.title && selected.category === task.category
                          );
                          
                          return (
                            <div
                              key={`${task.title}-${index}`}
                              className={`p-3 rounded-lg border transition-all ${
                                isAlreadyAdded 
                                  ? 'bg-gray-100 border-gray-200 opacity-60' 
                                  : isSelected 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`font-medium ${
                                      isAlreadyAdded ? 'text-gray-500' : 'text-gray-900'
                                    }`}>
                                      {task.title}
                                    </h4>
                                    {isSelected && (
                                      <CheckCircle className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <p className={`text-sm ${
                                    isAlreadyAdded ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {task.description}
                                  </p>
                                </div>
                                <Button
                                  size="sm" 
                                  variant={isAlreadyAdded ? "ghost" : isSelected ? "default" : "outline"}
                                  onClick={() => handlePredefinedTaskToggle(task)}
                                  disabled={isAlreadyAdded}
                                  className="ml-3 flex-shrink-0"
                                >
                                  {isAlreadyAdded ? 'Added' : isSelected ? 'Selected' : 'Add'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              {selectedPredefinedTasks.length > 0 && (
                <span>{selectedPredefinedTasks.length} task{selectedPredefinedTasks.length > 1 ? 's' : ''} ready to add</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClosePredefinedTasks}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSelectedTasks} 
                disabled={isAddingTasks || selectedPredefinedTasks.length === 0}
              >
                Add {selectedPredefinedTasks.length} Task{selectedPredefinedTasks.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        itemName={taskToDelete?.title}
        itemDetails={taskToDelete ? `${categories.find(c => c.value === taskToDelete.category)?.label} • Assigned to ${taskToDelete.assignedTo}` : undefined}
        itemIcon={<CheckSquare className="w-5 h-5 text-red-600" />}
        confirmText="Delete Task"
      />
    </div>
  );
}
