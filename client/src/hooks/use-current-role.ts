import { useState, useEffect } from 'react';
import { WeddingProfile } from '@shared/schema';

export type UserRole = 'bride' | 'groom' | 'planner' | 'parents' | 'family';

export function useCurrentRole(weddingProfile?: WeddingProfile) {
  const [currentRole, setCurrentRole] = useState<UserRole>('bride');
  const [currentUser, setCurrentUser] = useState({
    name: 'Loading...',
    initials: '...',
    role: 'bride' as UserRole
  });

  useEffect(() => {
    if (!weddingProfile) return;

    // Extract names from wedding profile
    const brideName = weddingProfile.brideName;
    const groomName = weddingProfile.groomName;
    
    // Generate initials
    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Update user info based on role
    const userInfo = {
      bride: { 
        name: brideName, 
        initials: getInitials(brideName)
      },
      groom: { 
        name: groomName, 
        initials: getInitials(groomName)
      },
      planner: { 
        name: 'Wedding Planner', 
        initials: 'WP' 
      },
      parents: { 
        name: 'Family Member', 
        initials: 'FM' 
      },
      family: { 
        name: 'Family Member', 
        initials: 'FM' 
      }
    };

    setCurrentUser({
      ...userInfo[currentRole],
      role: currentRole
    });
  }, [currentRole, weddingProfile]);

  return {
    currentRole,
    setCurrentRole,
    currentUser
  };
}
