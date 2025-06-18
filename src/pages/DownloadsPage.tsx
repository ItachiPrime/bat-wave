import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Download } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/hooks/usePlayerContext';
import { useToast } from '@/hooks/use-toast';

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState<Song[]>([]);
  const { playPlaylist } = usePlayer();
  const { toast } = useToast();

  useEffect(() => {
    // Load downloaded songs from localStorage
    const savedDownloads = localStorage.getItem('downloadedSongs');
    if (savedDownloads) {
      setDownloads(JSON.parse(savedDownloads));
    }
  }, []);

  const handlePlay = (song: Song, index: number) => {
    playPlaylist(downloads, index);
  };

  const handleDelete = (songId: string) => {
    const updatedDownloads = downloads.filter(song => song.id !== songId);
    setDownloads(updatedDownloads);
    localStorage.setItem('downloadedSongs', JSON.stringify(updatedDownloads));
    toast({
      title: "SONG DELETED",
      description: "Song has been removed from downloads.",
    });
  };

  const playAll = () => {
    if (downloads.length > 0) {
      playPlaylist(downloads, 0);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-auto mobile-full-height">
      <div className="flex items-center justify-between bat-gradient rounded-lg p-3 sm:p-4 border border-border">
        <h1 className="text-xl sm:text-2xl font-bold font-orbitron uppercase tracking-wider text-primary responsive-text-2xl">
          DOWNLOADS
        </h1>
        {downloads.length > 0 && (
          <Button 
            onClick={playAll}
            className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider text-xs sm:text-sm px-3 sm:px-4"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            PLAY ALL
          </Button>
        )}
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-orbitron uppercase tracking-wider responsive-text-lg">NO DOWNLOADED SONGS YET</p>
            <p className="text-sm font-orbitron mt-2">Search and download songs to see them here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pb-4">
          {downloads.map((song, index) => (
            <Card key={song.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bat-glow-blue">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate font-orbitron uppercase tracking-wide">
                      {song.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 font-orbitron">
                      {song.channel}
                    </p>
                    <p className="text-xs text-muted-foreground font-orbitron mb-3">
                      {song.duration}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handlePlay(song, index)}
                        className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs flex-1 sm:flex-none min-w-[70px]"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        PLAY
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(song.id)}
                        className="border-destructive/30 hover:border-destructive text-destructive hover:text-destructive font-orbitron uppercase text-xs flex-1 sm:flex-none min-w-[80px]"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;