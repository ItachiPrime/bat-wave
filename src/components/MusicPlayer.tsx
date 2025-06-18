
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { formatTime } from '@/utils/formatters';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleNext,
    handlePrevious,
    seekTo,
  } = useAudioPlayer();

  if (!currentSong) return null;

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  return (
    <div className="bg-card border-t p-4 space-y-3">
      {/* Song Info */}
      <div className="flex items-center gap-3">
        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{currentSong.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentSong.channel}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePrevious}>
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button size="icon" onClick={togglePlay}>
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleNext}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MusicPlayer;
