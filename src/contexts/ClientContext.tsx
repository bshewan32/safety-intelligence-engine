import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  allClients: boolean;
  setAllClients: (all: boolean) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [allClients, setAllClients] = useState<boolean>(true);

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedClientId');
    if (saved && saved !== 'null') {
      setSelectedClientId(saved);
      setAllClients(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      localStorage.setItem('selectedClientId', selectedClientId);
    } else {
      localStorage.removeItem('selectedClientId');
    }
  }, [selectedClientId]);

  return (
    <ClientContext.Provider 
      value={{ 
        selectedClientId, 
        setSelectedClientId, 
        allClients, 
        setAllClients 
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within ClientProvider');
  }
  return context;
}