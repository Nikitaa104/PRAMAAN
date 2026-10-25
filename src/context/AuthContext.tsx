import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User;
  switchUser: (role: UserRole | string) => void;
  availableUsers: User[];
  isAdmin: boolean;
  isOfficer: boolean;
  isInstitution: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('praman_user_id');
    if (saved) {
      const found = DEMO_USERS.find(u => u.id === saved);
      if (found) return found;
    }
    // Default to Scrutiny Officer for rich reviewer workflow demonstration
    return DEMO_USERS[1];
  });

  const switchUser = (roleOrId: UserRole | string) => {
    const byId = DEMO_USERS.find(u => u.id === roleOrId);
    if (byId) {
      setCurrentUser(byId);
      localStorage.setItem('praman_user_id', byId.id);
      return;
    }

    const byRole = DEMO_USERS.find(u => u.role === roleOrId);
    if (byRole) {
      setCurrentUser(byRole);
      localStorage.setItem('praman_user_id', byRole.id);
    }
  };

  useEffect(() => {
    localStorage.setItem('praman_user_id', currentUser.id);
  }, [currentUser]);

  const value = {
    currentUser,
    switchUser,
    availableUsers: DEMO_USERS,
    isAdmin: currentUser.role === 'Administrator',
    isOfficer: currentUser.role === 'Scrutiny Officer',
    isInstitution: currentUser.role === 'Institution Representative',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
