import { useState, useEffect } from 'react';

export type UserRole = 'bride' | 'groom' | 'planner' | 'parents' | 'family';

export function useCurrentRole() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bride');
  const [currentUser, setCurrentUser] = useState({
    name: 'Priya Kapoor',
    initials: 'PK',
    role: 'bride' as UserRole
  });

  useEffect(() => {
    // Update user info based on role
    const userInfo = {
      bride: { name: 'Priya Kapoor', initials: 'PK' },
      groom: { name: 'Rahul Sharma', initials: 'RS' },
      planner: { name: 'Wedding Planner', initials: 'WP' },
      parents: { name: 'Family Member', initials: 'FM' },
      family: { name: 'Family Member', initials: 'FM' }
    };

    setCurrentUser({
      ...userInfo[currentRole],
      role: currentRole
    });
  }, [currentRole]);

  return {
    currentRole,
    setCurrentRole,
    currentUser
  };
}
