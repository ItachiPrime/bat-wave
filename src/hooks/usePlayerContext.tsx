
import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from './useAudioPlayer';

const PlayerContext = createContext<ReturnType<typeof useAudioPlayer> | null>(null);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const player = useAudioPlayer();
  
  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
