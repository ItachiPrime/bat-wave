
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, Play } from 'lucide-react';
import { Song } from '@/types/music';
import { useToast } from '@/hooks/use-toast';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { playPlaylist } = useAudioPlayer();

  // Mock search function - replace with real YouTube API
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Mock data for demonstration - replace with actual YouTube API call
      const mockResults: Song[] = [
        {
          id: '1',
          title: 'Sample Song 1 - ' + query,
          channel: 'Sample Artist',
          duration: '3:45',
          thumbnail: 'https://picsum.photos/320/180?random=1',
          isDownloaded: false,
        },
        {
          id: '2',
          title: 'Sample Song 2 - ' + query,
          channel: 'Another Artist',
          duration: '4:12',
          thumbnail: 'https://picsum.photos/320/180?random=2',
          isDownloaded: false,
        },
        {
          id: '3',
          title: 'Sample Song 3 - ' + query,
          channel: 'Music Channel',
          duration: '2:58',
          thumbnail: 'https://picsum.photos/320/180?random=3',
          isDownloaded: false,
        },
      ];
      
      setResults(mockResults);
      toast({
        title: "SEARCH COMPLETE",
        description: `Found ${mockResults.length} results for "${query}"`,
      });
    } catch (error) {
      toast({
        title: "SEARCH ERROR",
        description: "Failed to search videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (song: Song) => {
    toast({
      title: "DOWNLOAD INITIATED",
      description: `Downloading "${song.title}"...`,
    });
    
    // Mock download process - replace with actual download logic
    setTimeout(() => {
      toast({
        title: "DOWNLOAD COMPLETE",
        description: `"${song.title}" has been downloaded.`,
      });
    }, 3000);
  };

  const handlePlay = (song: Song, index: number) => {
    playPlaylist(results, index);
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 bat-gradient rounded-lg p-4 border border-border">
        <h1 className="text-2xl font-bold mb-4 font-orbitron uppercase tracking-wider text-primary">
          SEARCH MUSIC
        </h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto bat-glow"></div>
          <p className="mt-2 text-muted-foreground font-orbitron uppercase tracking-wider">SCANNING...</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((song, index) => (
          <Card key={song.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bat-glow-blue">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-20 h-20 rounded object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 truncate font-orbitron uppercase tracking-wide">
                    {song.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 font-orbitron">
                    {song.channel}
                  </p>
                  <p className="text-xs text-muted-foreground font-orbitron">
                    {song.duration}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePlay(song, index)}
                      className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      PLAY
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(song)}
                      disabled={song.isDownloaded}
                      className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {song.isDownloaded ? 'DOWNLOADED' : 'DOWNLOAD'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
