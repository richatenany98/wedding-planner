import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentRole, UserRole } from '@/hooks/use-current-role';
import { Crown, User, Users, Heart, Star } from 'lucide-react';
import { WeddingProfile } from '@shared/schema';

interface RoleSelectorProps {
  weddingProfile?: WeddingProfile;
}

export function RoleSelector({ weddingProfile }: RoleSelectorProps) {
  const { currentRole, setCurrentRole } = useCurrentRole(weddingProfile);

  const roles = [
    { value: 'bride', label: 'Bride', icon: Crown, color: 'wedding-gradient-rose' },
    { value: 'groom', label: 'Groom', icon: Crown, color: 'wedding-gradient-blue' },
    { value: 'planner', label: 'Wedding Planner', icon: Star, color: 'wedding-gradient-gold' },
    { value: 'parents', label: 'Parents', icon: Heart, color: 'wedding-gradient-pink' },
    { value: 'family', label: 'Family Member', icon: Users, color: 'wedding-gradient-purple' },
  ];

  const currentRoleData = roles.find(role => role.value === currentRole);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wider">
        Current Role
      </label>
      <Select value={currentRole} onValueChange={(value) => setCurrentRole(value as UserRole)}>
        <SelectTrigger className="w-full wedding-input border-white/20 focus:border-rose-300 focus:ring-rose-200">
          <div className="flex items-center space-x-3">
            
            <SelectValue placeholder="Select role" />
          </div>
        </SelectTrigger>
        <SelectContent className="glass-morphism border-white/20">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <SelectItem 
                key={role.value} 
                value={role.value}
                className="flex items-center space-x-3 hover:bg-white/20 focus:bg-white/20"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${role.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={16} />
                  </div>
                  <span>{role.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
