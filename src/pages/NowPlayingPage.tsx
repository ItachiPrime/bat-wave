
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { formatTime } from '@/utils/formatters';

const NowPlayingPage = () => {
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
  } = useAudioPlayer();

  if (!currentSong) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2 font-orbitron uppercase tracking-wider">NO SONG PLAYING</p>
          <p className="text-sm font-orbitron">Choose a song from Search or Downloads to start listening</p>
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

  return (
    <div className="flex-1 p-4 space-y-6 overflow-auto">
      {/* Album Art */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-64 h-64 rounded-lg object-cover shadow-lg border-2 border-primary/30 bat-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg" />
        </div>
      </div>

      {/* Song Info */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold truncate font-orbitron uppercase tracking-wider text-primary">
          {currentSong.title}
        </h1>
        <p className="text-muted-foreground font-orbitron">{currentSong.channel}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
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
      <div className="flex items-center justify-center gap-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleShuffle}
          className={`${shuffle ? 'text-primary bat-glow' : 'hover:bat-glow-blue'}`}
        >
          <Shuffle className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevious}
          className="hover:bat-glow-blue"
        >
          <SkipBack className="h-6 w-6" />
        </Button>
        
        <Button 
          size="icon" 
          className="h-14 w-14 bat-glow hover:animate-glow-pulse" 
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNext}
          className="hover:bat-glow-blue"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleRepeat}
          className={`${repeat !== 'none' ? 'text-primary bat-glow' : 'hover:bat-glow-blue'}`}
        >
          <Repeat className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="flex-1 [&_.relative]:bg-bat-grey [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
        />
      </div>

      {/* Queue */}
      {playlist.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-medium font-orbitron uppercase tracking-wider text-primary">UP NEXT</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {playlist.slice(currentIndex + 1).map((song, index) => (
              <Card 
                key={`${song.id}-${index}`} 
                className="cursor-pointer hover:bg-accent/50 bg-card border-border hover:border-primary/50 transition-all duration-300"
                onClick={() => handleQueueSong(currentIndex + 1 + index)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate font-orbitron uppercase tracking-wide">
                        {song.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-orbitron">
                        {song.channel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlayingPage;
