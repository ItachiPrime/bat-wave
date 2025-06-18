// src/components/player-provider.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { Song, PlayerState, RepeatMode } from '@/types/music';

interface AudioPlayerContextType extends PlayerState {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  playSingleSong: (song: Song) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playerLoading: boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const player = useAudioPlayer();

  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within an AudioPlayerProvider. ' +
                    'Ensure your root component is wrapped with <AudioPlayerProvider>.');
  }
  return context;
};