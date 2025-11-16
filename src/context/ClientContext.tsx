import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Client {
  id: string;
  name: string;
}

interface ClientContextType {
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  clearActiveClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [activeClient, setActiveClientState] = useState<Client | null>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('activeClient');
    return stored ? JSON.parse(stored) : null;
  });

  const setActiveClient = (client: Client | null) => {
    setActiveClientState(client);
    if (client) {
      localStorage.setItem('activeClient', JSON.stringify(client));
    } else {
      localStorage.removeItem('activeClient');
    }
  };

  const clearActiveClient = () => {
    setActiveClientState(null);
    localStorage.removeItem('activeClient');
  };

  return (
    <ClientContext.Provider value={{ activeClient, setActiveClient, clearActiveClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
