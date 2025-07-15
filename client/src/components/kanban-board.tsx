import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Task, insertTaskSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

const taskFormSchema = insertTaskSchema.extend({
  eventId: z.number().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-neutral-50' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-50' },
  { id: 'done', title: 'Done', color: 'bg-green-50' },
];

const categories = [
  { value: 'venue', label: 'Venue', color: 'bg-blue-100 text-blue-800' },
  { value: 'decor', label: 'Decor', color: 'bg-green-100 text-green-800' },
  { value: 'food', label: 'Food', color: 'bg-purple-100 text-purple-800' },
  { value: 'attire', label: 'Attire', color: 'bg-red-100 text-red-800' },
  { value: 'invitations', label: 'Invitations', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'photography', label: 'Photography', color: 'bg-yellow-100 text-yellow-800' },
];

const predefinedTasks = [
  // Venue tasks
  { title: 'Book wedding venue', category: 'venue', description: 'Reserve main ceremony venue' },
  { title: 'Book reception venue', category: 'venue', description: 'Reserve reception hall' },
  { title: 'Visit venue for final checks', category: 'venue', description: 'Final venue inspection' },
  
  // Decor tasks
  { title: 'Choose mandap design', category: 'decor', description: 'Select mandap decoration style' },
  { title: 'Book decorator', category: 'decor', description: 'Hire decoration service' },
  { title: 'Choose flowers for ceremonies', category: 'decor', description: 'Select flower arrangements' },
  { title: 'Plan entrance decoration', category: 'decor', description: 'Design entrance decor' },
  
  // Food tasks
  { title: 'Book catering service', category: 'food', description: 'Hire catering company' },
  { title: 'Finalize menu', category: 'food', description: 'Confirm all meal options' },
  { title: 'Arrange for special dietary needs', category: 'food', description: 'Accommodate dietary restrictions' },
  { title: 'Book sweet vendor', category: 'food', description: 'Arrange traditional sweets' },
  
  // Attire tasks
  { title: 'Shop for bridal lehenga', category: 'attire', description: 'Purchase bridal outfit' },
  { title: 'Shop for groom\'s sherwani', category: 'attire', description: 'Purchase groom\'s outfit' },
  { title: 'Buy jewelry for bride', category: 'attire', description: 'Purchase wedding jewelry' },
  { title: 'Final fittings', category: 'attire', description: 'Complete outfit fittings' },
  
  // Invitations tasks
  { title: 'Design wedding invitations', category: 'invitations', description: 'Create invitation design' },
  { title: 'Print invitations', category: 'invitations', description: 'Print physical invitations' },
  { title: 'Send invitations', category: 'invitations', description: 'Distribute invitations to guests' },
  
  // Photography tasks
  { title: 'Book wedding photographer', category: 'photography', description: 'Hire photographer service' },
  { title: 'Book videographer', category: 'photography', description: 'Hire videography service' },
  { title: 'Plan pre-wedding shoot', category: 'photography', description: 'Schedule engagement photos' },
  { title: 'Finalize shot list', category: 'photography', description: 'Create photography checklist' },
];

const roles = [
  { value: 'bride', label: 'Bride' },
  { value: 'groom', label: 'Groom' },
  { value: 'planner', label: 'Planner' },
  { value: 'parents', label: 'Parents' },
  { value: 'family', label: 'Family' },
];

export function KanbanBoard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPredefinedTasks, setShowPredefinedTasks] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest('POST', '/api/tasks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      const response = await apiRequest('PUT', `/api/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
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
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
  };

  const handleAddPredefinedTask = (predefinedTask: typeof predefinedTasks[0]) => {
    const taskData = {
      title: predefinedTask.title,
      description: predefinedTask.description,
      category: predefinedTask.category,
      status: 'todo',
      assignedTo: 'bride',
      dueDate: '',
    };
    createTaskMutation.mutate(taskData);
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Task Management</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPredefinedTasks(true)}>
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
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task description" {...field} />
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
                          {categories.map((category) => (
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
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingTask(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTask ? 'Update' : 'Add'} Task
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Predefined Tasks Dialog */}
        <Dialog open={showPredefinedTasks} onOpenChange={setShowPredefinedTasks}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Tasks from Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryTasks = predefinedTasks.filter(task => task.category === category.value);
                return (
                  <div key={category.value} className="space-y-2">
                    <h4 className="font-medium text-lg text-neutral-800">{category.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryTasks.map((task, index) => (
                        <div key={index} className="p-3 border rounded-lg bg-neutral-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-neutral-800">{task.title}</h5>
                              <p className="text-xs text-neutral-600 mt-1">{task.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddPredefinedTask(task)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className={`${column.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-neutral-800">{column.title}</h4>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(task.category)}>
                          {categories.find(c => c.value === task.category)?.label}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <h5 className="font-medium text-neutral-800 mb-2">{task.title}</h5>
                      {task.description && (
                        <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 ${getAssigneeColor(task.assignedTo)} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-xs font-medium">
                              {getAssigneeInitials(task.assignedTo)}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-600 capitalize">{task.assignedTo}</span>
                        </div>
                        {task.dueDate && (
                          <span className="text-xs text-neutral-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Status change buttons */}
                      <div className="flex justify-between mt-3 pt-2 border-t border-neutral-200">
                        {columns.map((col) => (
                          <Button
                            key={col.id}
                            variant={task.status === col.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(task.id, col.id)}
                            className="text-xs"
                          >
                            {col.title}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
