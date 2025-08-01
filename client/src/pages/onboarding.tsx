import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Users, DollarSign, Calendar } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const onboardingSchema = z.object({
  brideName: z.string().min(1, 'Bride name is required'),
  groomName: z.string().min(1, 'Groom name is required'),
  weddingStartDate: z.string().min(1, 'Wedding start date is required'),
  weddingEndDate: z.string().min(1, 'Wedding end date is required'),
  venue: z.string().min(1, 'Venue is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  guestCount: z.number().min(1, 'Guest count must be at least 1'),
  budget: z.number().min(1, 'Budget must be at least $1'),
  functions: z.array(z.string()).min(1, 'Select at least one function'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingProps {
  user: any;
  onComplete: (weddingProfile: any) => void;
}

const weddingFunctions = [
  { id: 'ganesh-puja', label: 'Ganesh Puja', description: 'Prayer ceremony to Lord Ganesha for auspicious beginnings' },
  { id: 'welcome-party', label: 'Welcome Party', description: 'Welcome celebration for out-of-town guests' },
  { id: 'grah-shanti', label: 'Grah Shanti', description: 'Ceremony to remove obstacles and bring peace' },
  { id: 'haldi', label: 'Haldi', description: 'Turmeric ceremony for purification and blessings' },
  { id: 'mayra', label: 'Mayra', description: 'Maternal uncle\'s blessing ceremony' },
  { id: 'sangeet', label: 'Sangeet', description: 'Musical celebration with dance and performances' },
  { id: 'wedding', label: 'Wedding', description: 'Main wedding ceremony with sacred rituals' },
  { id: 'reception', label: 'Reception', description: 'Grand celebration and dinner for all guests' },
];



const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function Onboarding({ user, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      brideName: '',
      groomName: '',
      weddingStartDate: '',
      weddingEndDate: '',
      venue: '',
      city: '',
      state: '',
      guestCount: 0,
      budget: 0,
      functions: [],
    },
  });

  const steps = [
    {
      title: 'Couple Details',
      description: 'Tell us about the happy couple',
      icon: Heart,
      fields: ['brideName', 'groomName', 'weddingStartDate', 'weddingEndDate']
    },
    {
      title: 'Wedding Location',
      description: 'Where will your celebration take place?',
      icon: MapPin,
      fields: ['venue', 'city', 'state']
    },
    {
      title: 'Guest & Budget',
      description: 'How many guests and what\'s your budget?',
      icon: Users,
      fields: ['guestCount', 'budget']
    },
    {
      title: 'Wedding Functions',
      description: 'Which ceremonies will you have?',
      icon: Calendar,
      fields: ['functions']
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    console.log('🚀 Form submission started with data:', data);
    setIsLoading(true);
    
    try {
      console.log('📡 Making API request to /api/wedding-profile...');
      const response = await apiRequest('POST', '/api/wedding-profile', {
        ...data,
        userId: user.id,
        isComplete: true,
      });
      console.log('✅ API response received:', response);
      const weddingProfile = await response.json();
      console.log('📋 Wedding profile created:', weddingProfile);
      onComplete(weddingProfile);
    } catch (err) {
      console.error('❌ Failed to save wedding profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    const values = form.getValues();
    
    const isValid = currentFields.every(field => {
      const value = values[field as keyof OnboardingFormData];
      if (field === 'functions') {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== '' && value !== 0;
    });
    
    console.log('🔍 Step validation:', {
      currentStep,
      currentFields,
      values,
      isValid
    });
    
    return isValid;
  };

  const handleCancel = () => {
    // Remove user and weddingProfile from localStorage and reload
    localStorage.removeItem('user');
    localStorage.removeItem('weddingProfile');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl bg-white/90 backdrop-blur-sm border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="text-rose-500 w-12 h-12" fill="currentColor" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Let's Plan Your Dream Wedding
          </CardTitle>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-neutral-600 mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
              {(() => {
                const IconComponent = steps[currentStep].icon;
                return <IconComponent className="w-5 h-5 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{steps[currentStep].title}</h3>
              <p className="text-neutral-600">{steps[currentStep].description}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brideName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bride's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bride's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="groomName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groom's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter groom's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weddingStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wedding Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weddingEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wedding End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter venue name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter budget amount" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="functions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wedding Functions</FormLabel>
                        <div className="grid grid-cols-1 gap-3">
                          {weddingFunctions.map((func) => (
                            <div key={func.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={func.id}
                                checked={field.value.includes(func.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, func.id]);
                                  } else {
                                    field.onChange(field.value.filter((id) => id !== func.id));
                                  }
                                }}
                              />
                              <label htmlFor={func.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div>
                                  <div className="font-medium">{func.label}</div>
                                  <div className="text-neutral-600 text-xs">{func.description}</div>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}



              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  className="ml-2 text-rose-500 hover:text-rose-700"
                >
                  Cancel / Back to Login
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isStepValid() || isLoading}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                    onClick={() => {
                      console.log('🔘 Complete Setup button clicked!');
                      console.log('Form is valid:', isStepValid());
                      console.log('Is loading:', isLoading);
                    }}
                  >
                    {isLoading ? 'Saving...' : 'Complete Setup'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}