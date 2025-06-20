// src/hooks/use-audio-player.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { Howl } from "howler";
import { Song, PlayerState, RepeatMode } from "@/types/music";
import { useToast } from "@/hooks/use-toast"; // Assuming this is your shadcn/ui toast hook

const initialPlayerState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  isSingleSong: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7, // Default volume set to 0.7
  playlist: [],
  currentIndex: -1,
  repeat: "none",
  shuffle: false,
};

export const useAudioPlayer = () => {
  const [playerState, setPlayerState] =
    useState<PlayerState>(initialPlayerState);
  const [playerLoading, setPlayerLoading] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const nextHowlRef = useRef<Howl | null>(null); // <-- Add this
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // State to signal that a song has ended, triggering handleNext in an effect
  const [songEndedSignal, setSongEndedSignal] = useState(0);

  // Ref to always hold the latest playerState
  const stateRef = useRef<PlayerState>(initialPlayerState);

  // Keep stateRef always up-to-date with the latest playerState
  useEffect(() => {
    stateRef.current = playerState;
    // When playerState changes, ensure Howl's volume is updated if an instance exists
    if (howlRef.current && howlRef.current.volume() !== playerState.volume) {
      howlRef.current.volume(playerState.volume);
    }
  }, [playerState]);

  // This function is now only responsible for managing the Howl instance
  const loadSongForPlayback = useCallback(
    (song: Song, playOnLoad: boolean) => {
      setPlayerLoading(true); // Start loading

      // Clean up previous Howl
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }

      const audioUrl = song.audioUrl || song.url;
      if (!audioUrl) {
        toast({
          title: "Playback Error",
          description: "No audio URL found for this song.",
          variant: "destructive",
        });
        setPlayerLoading(false);
        return;
      }

      howlRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        volume: playerState.volume,
        onload: () => {
          setPlayerState((prev) => ({
            ...prev,
            duration: howlRef.current?.duration() || 0,
          }));
          setPlayerLoading(false);
          if (playOnLoad) {
            howlRef.current?.play();
          }
          // Preload next song if in a playlist
          if (
            !stateRef.current.isSingleSong &&
            stateRef.current.playlist.length > 0
          ) {
            preloadNextSong(
              stateRef.current.playlist,
              stateRef.current.currentIndex
            );
          }
        },
        onplay: () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));
          // setPlayerLoading(false); // Already set in onload
          // Start time update interval if needed
          if (timeUpdateIntervalRef.current)
            clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = setInterval(() => {
            setPlayerState((prev) => ({
              ...prev,
              currentTime: (howlRef.current?.seek() as number) || 0,
            }));
          }, 500);
        },
        onpause: () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          if (timeUpdateIntervalRef.current)
            clearInterval(timeUpdateIntervalRef.current);
        },
        onend: () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
          if (timeUpdateIntervalRef.current)
            clearInterval(timeUpdateIntervalRef.current);
          setSongEndedSignal((sig) => sig + 1);
        },
        onloaderror: (id, error) => {
          setPlayerLoading(false);
          toast({
            title: "Playback Error",
            description: "Failed to load audio.",
            variant: "destructive",
          });
        },
        onplayerror: (id, error) => {
          setPlayerLoading(false);
          toast({
            title: "Playback Error",
            description: "Failed to play audio.",
            variant: "destructive",
          });
        },
      });

      setPlayerState((prev) => ({
        ...prev,
        currentSong: song,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }));
    },
    [toast, playerState.volume]
  );

  const play = useCallback(() => {
    const song = stateRef.current.currentSong;

    if (!song) {
      console.warn("Attempted to play, but no current song is set.");
      return;
    }

    if (howlRef.current) {
      howlRef.current.play(); // Always call play, even if already playing
      setPlayerState((prev) => ({ ...prev, isPlaying: true }));
    } else {
      loadSongForPlayback(song, true);
    }
  }, [loadSongForPlayback]);
  // Dependency on loadSongForPlayback is needed

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause(); // Always call pause, even if already paused
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  // All functions that change tracks now use stateRef to avoid stale state.
  const handleNext = useCallback(() => {
    const { playlist, currentIndex, repeat, shuffle, isSingleSong } =
      stateRef.current;

    // Handle repeat one for single song or current song in a playlist
    if (repeat === "one" && stateRef.current.currentSong) {
      // Instead of seek(0), reload and play again
      loadSongForPlayback(stateRef.current.currentSong, true);
      return;
    }

    // If it's a single song (and not repeat "one"), stop playback
    if (isSingleSong) {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      howlRef.current?.stop(); // Ensure Howl also stops
      howlRef.current = null; // Clear Howl instance
      return;
    }

    if (playlist.length === 0) {
      setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      howlRef.current?.stop(); // Ensure Howl also stops
      howlRef.current = null; // Clear Howl instance
      return;
    }

    let nextIndex;
    if (shuffle) {
      // Pick a random index, ensuring it's not the same as current if possible for larger playlists
      if (playlist.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex);
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= playlist.length) {
      if (repeat === "all") {
        nextIndex = 0; // Loop back to the beginning
      } else {
        // End of playlist, not repeating
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          currentSong: null,
          currentIndex: -1,
          currentTime: 0,
          duration: 0,
          playlist: [],
        }));
        howlRef.current?.stop(); // Ensure Howl also stops
        howlRef.current = null; // Clear Howl instance
        return;
      }
    }

    const nextSong = playlist[nextIndex];
    setPlayerState((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      currentSong: nextSong,
      currentTime: 0,
      duration: howlRef.current?.duration() || 0,
      isPlaying: true,
    }));

    // Use preloaded Howl if available
    if (nextHowlRef.current) {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      howlRef.current = nextHowlRef.current;
      nextHowlRef.current = null;

      // Attach event listeners to the new Howl instance
      howlRef.current.on("end", () => {
        setSongEndedSignal((s) => s + 1);
      });
      howlRef.current.on("play", () => {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: true,
          duration: howlRef.current?.duration() || 0,
          currentTime: 0,
        }));
        // Start interval for seekbar
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        timeUpdateIntervalRef.current = setInterval(() => {
          setPlayerState((prev) => ({
            ...prev,
            currentTime: (howlRef.current?.seek() as number) || 0,
          }));
        }, 500);
      });
      howlRef.current.on("pause", () => {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
        }));
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
      });

      // Update state immediately for UI
      setPlayerState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        currentSong: nextSong,
        currentTime: 0,
        duration: howlRef.current?.duration() || 0,
        isPlaying: true,
      }));

      howlRef.current.play();
      preloadNextSong(playlist, nextIndex);
    } else {
      loadSongForPlayback(nextSong, true);
    }
  }, [play, loadSongForPlayback]); // Dependency on loadSongForPlayback is crucial here

  const handlePrevious = useCallback(() => {
    const { playlist, currentIndex } = stateRef.current;
    if (playlist.length === 0) return;

    // If current time is past 3 seconds, restart current song instead of going to previous
    if (howlRef.current && howlRef.current.seek() > 3) {
      howlRef.current.seek(0);
      play();
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1; // Loop back to end of playlist
    }

    const prevSong = playlist[prevIndex];
    // Immediately update player state with the new song before loading it
    setPlayerState((prev) => ({
      ...prev,
      currentIndex: prevIndex,
      currentSong: prevSong,
      currentTime: 0,
      duration: 0,
      isPlaying: false, // will be set to true by onplay
    }));
    loadSongForPlayback(prevSong, true);
  }, [play, loadSongForPlayback]); // Dependency on loadSongForPlayback is crucial here

  const playSingleSong = useCallback(
    (song: Song) => {
      // Set isSingleSong and clear playlist before loading
      setPlayerState((prev) => ({
        ...prev,
        currentSong: song,
        playlist: [song],
        currentIndex: 0,
        isSingleSong: true,
        currentTime: 0,
        duration: song.duration
          ? typeof song.duration === "number"
            ? song.duration
            : (() => {
                // Parse "m:ss" or "h:mm:ss" to seconds
                const parts = song.duration.split(":").map(Number);
                if (parts.length === 3)
                  return parts[0] * 3600 + parts[1] * 60 + parts[2];
                if (parts.length === 2) return parts[0] * 60 + parts[1];
                return 0;
              })()
          : 0,
        isPlaying: false,
        repeat: "none",
        shuffle: false,
      }));
      // Load and play immediately (do not wait for state update)
      loadSongForPlayback(song, true);
    },
    [loadSongForPlayback]
  );

  const playPlaylist = useCallback(
    (songs: Song[], startIndex = 0) => {
      if (!songs || songs.length === 0) {
        toast({
          title: "Info",
          description: "No songs provided to play in playlist.",
        });
        setPlayerState(initialPlayerState);
        howlRef.current?.unload();
        howlRef.current = null;
        return;
      }
      const effectiveStartIndex = Math.min(
        Math.max(0, startIndex),
        songs.length - 1
      );
      console.log(
        "▶️ playPlaylist CALLED for:",
        songs[effectiveStartIndex]?.title,
        "at index",
        effectiveStartIndex
      );

      // Immediately set currentSong and related properties in one go
      setPlayerState((prev) => ({
        ...prev,
        playlist: songs,
        currentIndex: effectiveStartIndex,
        currentSong: songs[effectiveStartIndex],
        isSingleSong: false, // It's a playlist now
        currentTime: 0,
        duration: 0,
        isPlaying: false, // Ensure it's false before load; onplay will make it true
      }));
      // Then load and play
      loadSongForPlayback(songs[effectiveStartIndex], true);
    },
    [loadSongForPlayback, toast]
  );

  const seekTo = useCallback((time: number) => {
    if (howlRef.current) {
      const duration = howlRef.current.duration();
      const seekTime = Math.min(Math.max(0, time), duration || 0); // Clamp to valid range
      howlRef.current.seek(seekTime);
      setPlayerState((prev) => ({ ...prev, currentTime: seekTime }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    // Ensure volume is between 0 and 1
    const newVolume = Math.min(Math.max(0, volume), 1);
    if (howlRef.current) {
      howlRef.current.volume(newVolume);
    }
    setPlayerState((prev) => ({ ...prev, volume: newVolume }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      repeat:
        prev.repeat === "none" ? "one" : prev.repeat === "one" ? "all" : "none",
    }));
  }, []);

  // React to song end signal and call handleNext
  useEffect(() => {
    if (songEndedSignal > 0) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songEndedSignal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (howlRef.current) {
        howlRef.current.unload();
      }
      if (nextHowlRef.current) {
        nextHowlRef.current.unload();
      }
    };
  }, []);

  const preloadNextSong = useCallback(
    (playlist: Song[], currentIndex: number) => {
      if (!playlist || playlist.length === 0) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) return;
      const nextSong = playlist[nextIndex];
      const audioUrl = nextSong.audioUrl || nextSong.url;
      if (!audioUrl) return;

      // Clean up previous preloaded Howl
      if (nextHowlRef.current) {
        nextHowlRef.current.unload();
        nextHowlRef.current = null;
      }

      nextHowlRef.current = new Howl({
        src: [audioUrl],
        html5: true,
        volume: playerState.volume,
        preload: true,
      });
    },
    [playerState.volume]
  );

  return {
    ...playerState,
    playerLoading, // <-- expose this
    play,
    pause,
    togglePlay,
    seekTo,
    setVolume,
    handleNext,
    handlePrevious,
    playPlaylist,
    playSingleSong,
    toggleShuffle,
    toggleRepeat,
  };
};
