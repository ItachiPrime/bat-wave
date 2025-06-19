import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayerContext";
import { useMusicControls } from "@/hooks/useMusicControls";

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleNext,
    handlePrevious,
    playerLoading,
  } = usePlayer();

  useMusicControls(
    currentSong,
    isPlaying,
    togglePlay,
    () => {
      if (isPlaying) togglePlay();
    },
    handleNext,
    handlePrevious
  );

  if (!currentSong) {
    return null;
  }

  // Calculate progress percentage
  const progressPercent = duration
    ? Math.min((currentTime / duration) * 100, 100)
    : 0;

  return (
    <div className="bg-card border-t border-border p-3 sm:p-4 scan-line safe-area-padding-bottom relative">
      {/* Minimal Progress Bar */}
      <div className="absolute left-0 top-0 w-full h-1 bg-bat-grey/40">
        <div
          className="h-1 bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover border border-border flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs sm:text-sm truncate font-orbitron uppercase tracking-wide">
              {currentSong.title}
            </p>
            <p className="text-xs text-muted-foreground truncate font-orbitron">
              {currentSong.channel}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-8 w-8 hover:bg-muted active:bg-muted focus:bg-muted data-[state=active]:bg-muted z-10"
            disabled={playerLoading}
          >
            <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          {/* Play/Pause or Spinner */}
          {playerLoading && !isPlaying ? (
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></span>
            </div>
          ) : (
            <Button
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 bat-glow hover:animate-glow-pulse z-10"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <Play className="h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8 hover:bg-muted active:bg-muted focus:bg-muted data-[state=active]:bg-muted z-10"
            disabled={playerLoading}
          >
            <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
