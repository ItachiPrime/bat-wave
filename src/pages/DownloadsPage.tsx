
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';
import { Song } from '@/types/music';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useToast } from '@/hooks/use-toast';

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState<Song[]>([]);
  const { playPlaylist } = useAudioPlayer();
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
      title: "Song Deleted",
      description: "Song has been removed from downloads.",
    });
  };

  const playAll = () => {
    if (downloads.length > 0) {
      playPlaylist(downloads, 0);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Downloads</h1>
        {downloads.length > 0 && (
          <Button onClick={playAll}>
            <Play className="h-4 w-4 mr-2" />
            Play All
          </Button>
        )}
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No downloaded songs yet</p>
            <p className="text-sm">Search and download songs to see them here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((song, index) => (
            <Card key={song.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 truncate">{song.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{song.channel}</p>
                    <p className="text-xs text-muted-foreground">{song.duration}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => handlePlay(song, index)}>
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(song.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
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
