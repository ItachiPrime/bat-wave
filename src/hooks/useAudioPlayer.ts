import { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { Song, PlayerState } from '@/types/music';
import { useToast } from '@/hooks/use-toast';

export const useAudioPlayer = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playlist: [],
    currentIndex: -1,
    repeat: 'none',
    shuffle: false,
  });

  const howlRef = useRef<Howl | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const loadSong = useCallback((song: Song) => {
    if (howlRef.current) {
      howlRef.current.unload();
    }

    // Clear existing interval
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    const audioUrl = song.localPath || song.url || `https://www.soundjay.com/misc/sounds/bell-ringing-05.wav`;
    
    howlRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      onload: () => {
        setPlayerState(prev => ({
          ...prev,
          duration: howlRef.current?.duration() || 0,
        }));
      },
      onplay: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
        // Start time update interval
        timeUpdateIntervalRef.current = setInterval(() => {
          if (howlRef.current && howlRef.current.playing()) {
            setPlayerState(prev => ({
              ...prev,
              currentTime: howlRef.current?.seek() || 0,
            }));
          }
        }, 1000);
      },
      onpause: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
      },
      onend: () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = null;
        }
        handleNext();
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
        toast({
          title: "Playback Error",
          description: "Failed to load audio file",
          variant: "destructive",
        });
      },
    });

    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      currentTime: 0,
    }));
  }, [toast]);

  const play = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playerState.isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    }
  }, []);

  const handleNext = useCallback(() => {
    const { playlist, currentIndex, repeat, shuffle } = playerState;
    
    if (playlist.length === 0) return;

    let nextIndex = currentIndex;

    if (repeat === 'one') {
      // Replay current song
      if (howlRef.current) {
        howlRef.current.seek(0);
        howlRef.current.play();
      }
      return;
    }

    if (shuffle) {
      // Random next song
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return; // End of playlist
        }
      }
    }

    setPlayerState(prev => ({ ...prev, currentIndex: nextIndex }));
    loadSong(playlist[nextIndex]);
  }, [playerState, loadSong]);

  const handlePrevious = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    
    if (playlist.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }

    setPlayerState(prev => ({ ...prev, currentIndex: prevIndex }));
    loadSong(playlist[prevIndex]);
  }, [playerState, loadSong]);

  const playPlaylist = useCallback((songs: Song[], startIndex = 0) => {
    setPlayerState(prev => ({
      ...prev,
      playlist: songs,
      currentIndex: startIndex,
    }));
    if (songs.length > 0) {
      loadSong(songs[startIndex]);
    }
  }, [loadSong]);

  const toggleShuffle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'all' : prev.repeat === 'all' ? 'one' : 'none',
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, []);

  return {
    ...playerState,
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    handleNext,
    handlePrevious,
    playPlaylist,
    toggleShuffle,
    toggleRepeat,
    loadSong,
  };
};