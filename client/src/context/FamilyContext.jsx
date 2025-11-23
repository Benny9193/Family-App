import { createContext, useContext, useState, useEffect } from 'react';
import { familyService } from '../services/api';
import { useAuth } from './AuthContext';

const FamilyContext = createContext(null);

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return context;
};

export const FamilyProvider = ({ children }) => {
  const { user } = useAuth();
  const [families, setFamilies] = useState([]);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFamilies();
    } else {
      setFamilies([]);
      setCurrentFamily(null);
      setLoading(false);
    }
  }, [user]);

  const loadFamilies = async () => {
    try {
      const data = await familyService.getFamilies();
      setFamilies(data);
      if (data.length > 0 && !currentFamily) {
        setCurrentFamily(data[0]);
      }
    } catch (error) {
      console.error('Failed to load families:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (name) => {
    const newFamily = await familyService.createFamily(name);
    setFamilies([...families, newFamily]);
    setCurrentFamily(newFamily);
    return newFamily;
  };

  const joinFamily = async (inviteCode) => {
    const family = await familyService.joinFamily(inviteCode);
    await loadFamilies();
    setCurrentFamily(family.family);
    return family;
  };

  const switchFamily = (family) => {
    setCurrentFamily(family);
  };

  return (
    <FamilyContext.Provider
      value={{
        families,
        currentFamily,
        loading,
        createFamily,
        joinFamily,
        switchFamily,
        refreshFamilies: loadFamilies
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};
