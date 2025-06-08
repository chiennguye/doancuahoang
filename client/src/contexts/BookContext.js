import { createContext, useContext, useState } from 'react';

const BookContext = createContext();

export function BookProvider({ children }) {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  const triggerRefresh = () => {
    setShouldRefresh(prev => !prev);
    setLastUpdateTime(Date.now());
  };

  return (
    <BookContext.Provider value={{ shouldRefresh, triggerRefresh, lastUpdateTime }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
} 