import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentRole } from '@/hooks/use-current-role';

export function RoleSelector() {
  const { currentRole, setCurrentRole } = useCurrentRole();

  const roles = [
    { value: 'bride', label: 'Bride' },
    { value: 'groom', label: 'Groom' },
    { value: 'planner', label: 'Wedding Planner' },
    { value: 'parents', label: 'Parents' },
    { value: 'family', label: 'Family Member' },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-neutral-700 mb-2">Current Role</label>
      <Select value={currentRole} onValueChange={setCurrentRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
