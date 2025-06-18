import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
} from "lucide-react";
import { usePlayer } from "@/hooks/usePlayerContext";
import { formatTime } from "@/utils/formatters";

const fallbackThumbnail = "/fallback-thumbnail.png";

const NowPlayingPage = () => {
  // This single call now gets the state from the context provider
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    repeat,
    shuffle,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playPlaylist,
  } = usePlayer();

  if (!currentSong) {
    return (
      <div className="flex-1 p-3 sm:p-4 flex items-center justify-center mobile-full-height">
        <div className="text-center text-muted-foreground">
          <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
          <p className="text-base sm:text-lg mb-2 font-orbitron uppercase tracking-wider responsive-text-lg">
            NO SONG PLAYING
          </p>
          <p className="text-sm font-orbitron">
            Choose a song to start listening
          </p>
        </div>
      </div>
    );
  }

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleQueueSong = (index: number) => {
    playPlaylist(playlist, index);
  };

  const isSingleSong = playlist.length <= 1;

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-auto mobile-full-height">
      {/* Album Art */}
      <div className="flex justify-center pt-16">
        <div className="relative">
          <img
            src={currentSong.thumbnail || fallbackThumbnail}
            alt={currentSong.title || "Unknown Title"}
            className="w-64 h-64 rounded-lg object-cover shadow-lg border-2 border-primary/30 bat-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg" />
        </div>
      </div>

      {/* Song Info */}
      <div className="text-center space-y-2">
        <h1 className="text-lg sm:text-xl font-bold truncate font-orbitron uppercase tracking-wider text-primary responsive-text-xl px-4">
          {currentSong.title || "Untitled"}
        </h1>
        <p className="text-muted-foreground font-orbitron text-sm sm:text-base">
          {currentSong.channel || "Unknown Artist"}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2 pt-24 px-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="w-full [&_.relative]:bg-bat-grey [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:bat-glow"
        />
        <div className="flex justify-between text-sm text-muted-foreground font-orbitron">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleShuffle}
          className={`h-8 w-8 sm:h-10 sm:w-10 ${
            shuffle ? "text-primary bat-glow" : "hover:bat-glow-blue"
          }`}
        >
          <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="hover:bat-glow-blue h-8 w-8 sm:h-10 sm:w-10"
        >
          <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <Button
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 bat-glow hover:animate-glow-pulse"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
          ) : (
            <Play className="h-6 w-6 sm:h-7 sm:w-7" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="hover:bat-glow-blue h-8 w-8 sm:h-10 sm:w-10"
        >
          <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRepeat}
          className={`h-8 w-8 sm:h-10 sm:w-10 ${
            repeat !== "none" ? "text-primary bat-glow" : "hover:bat-glow-blue"
          }`}
        >
          <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

    </div>
  );
};

export default NowPlayingPage;