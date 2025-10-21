import React, { useState, useEffect, useCallback } from 'react';
import type { RecordingEntry } from './types';
import { Header } from './components/Header';
import { Recorder } from './components/Recorder';
import { EntryList } from './components/EntryList';
import { LoginScreen } from './components/auth/LoginScreen';
import { SetupScreen } from './components/auth/SetupScreen';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [entries, setEntries] = useState<RecordingEntry[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const getStorageKey = useCallback(() => {
    return userEmail ? `rooznegar-entries-${userEmail}` : null;
  }, [userEmail]);


  useEffect(() => {
    try {
      const email = localStorage.getItem('rooznegar-user-email');
      const hash = localStorage.getItem('rooznegar-password-hash');
      if (email && hash) {
        setUserEmail(email);
        setNeedsSetup(false);
      } else {
        setNeedsSetup(true);
      }
    } catch (error) {
        console.error("Failed to check user setup", error);
        setNeedsSetup(true);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      try {
        const storageKey = getStorageKey();
        if (storageKey) {
            const storedEntries = localStorage.getItem(storageKey);
            if (storedEntries) {
                setEntries(JSON.parse(storedEntries));
            } else {
                setEntries([]);
            }
        }
      } catch (error) {
        console.error("Failed to load entries from localStorage", error);
      }
    }
  }, [isAuthenticated, userEmail, getStorageKey]);

  const saveEntries = useCallback((updatedEntries: RecordingEntry[]) => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error("Failed to save entries to localStorage", error);
    }
  }, [getStorageKey]);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };
  
  const handleSetupSuccess = (email: string) => {
    setUserEmail(email);
    setNeedsSetup(false);
    setIsAuthenticated(true);
  };

  const addEntry = (newEntry: Omit<RecordingEntry, 'id' | 'createdAt'>) => {
    const entry: RecordingEntry = {
      ...newEntry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveEntries([entry, ...entries]);
  };

  const updateEntry = (updatedEntry: RecordingEntry) => {
    const updatedEntries = entries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    saveEntries(updatedEntries);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  };

  if (needsSetup) {
    return <SetupScreen onSetupSuccess={handleSetupSuccess} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto max-w-3xl p-4">
        <Recorder onAddEntry={addEntry} />
        <EntryList entries={entries} onUpdateEntry={updateEntry} onDeleteEntry={deleteEntry} />
      </main>
       <footer className="text-center p-4 text-xs text-gray-500">
        <p>روزنگار من - ساخته شده با ❤️ توسط یک متخصص Gemini API</p>
      </footer>
    </div>
  );
};

export default App;