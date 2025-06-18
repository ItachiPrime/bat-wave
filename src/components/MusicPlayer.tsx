import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayerContext';
import { formatTime } from '@/utils/formatters';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    playerLoading, // <-- add this
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="bg-card border-t border-border p-3 sm:p-4 scan-line safe-area-padding-bottom">
      {/* Progress Bar */}
      <div className="mb-3">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="w-full [&_.relative]:bg-bat-grey [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:bat-glow"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1 font-orbitron">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
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
            className="h-8 w-8 hover:bat-glow-blue"
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
              onClick={togglePlay}
              className="h-8 w-8 sm:h-10 sm:w-10 bat-glow hover:animate-glow-pulse z-10"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            className="h-8 w-8 hover:bat-glow-blue"
            disabled={playerLoading}
          >
            <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Volume - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 min-w-0 w-20">
          <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="flex-1 [&_.relative]:bg-bat-grey [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;