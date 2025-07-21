import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  name: z.string().min(1, 'Name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/auth/login', data);
      const user = await response.json();
      onLogin(user);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        username: data.username,
        password: data.password,
        name: data.name,
        role: 'bride'
      });
      const user = await response.json();
      onLogin(user);
    } catch (err) {
      setError('Registration failed. Username might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 wedding-gradient-rose rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 wedding-gradient-pink rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 wedding-gradient-gold rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 wedding-gradient-purple rounded-full opacity-20 animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <Card className="w-full max-w-md glass-morphism border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 wedding-gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white w-8 h-8" fill="currentColor" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 wedding-gradient-gold rounded-full flex items-center justify-center">
                <Sparkles className="text-white w-3 h-3" fill="currentColor" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            WeddingWizard
          </CardTitle>
          <CardDescription className="text-lg text-neutral-600">
            {isRegistering 
              ? 'Start planning your dream wedding' 
              : 'Welcome back to your magical journey'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isRegistering ? (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="wedding-input"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  className="wedding-input"
                  {...registerForm.register('username')}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="wedding-input"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="wedding-input"
                  {...registerForm.register('confirmPassword')}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="btn-wedding-primary w-full text-lg py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="wedding-input"
                  {...loginForm.register('username')}
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="wedding-input"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="btn-wedding-primary w-full text-lg py-3"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="absolute top-4 right-4 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <Star key={i} className="text-pink-300 w-4 h-4" fill="currentColor" />
        ))}
      </div>
      
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <Star key={i} className="text-rose-300 w-4 h-4" fill="currentColor" />
        ))}
      </div>
    </div>
  );
}