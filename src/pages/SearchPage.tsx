import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Download, Play } from 'lucide-react';
import { Song } from '@/types/music';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '@/hooks/usePlayerContext';

// Create a global state manager for search
const searchStateManager = {
  query: '',
  results: [] as Song[],
  loading: false,
  listeners: new Set<() => void>(),
  
  setQuery(newQuery: string) {
    this.query = newQuery;
    this.notifyListeners();
  },
  
  setResults(newResults: Song[]) {
    this.results = newResults;
    this.notifyListeners();
  },
  
  setLoading(loading: boolean) {
    this.loading = loading;
    this.notifyListeners();
  },
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
};

const SearchPage = () => {
  const [query, setQuery] = useState(searchStateManager.query);
  const [results, setResults] = useState<Song[]>(searchStateManager.results);
  const [loading, setLoading] = useState(searchStateManager.loading);
  const { toast } = useToast();
  const { playPlaylist } = usePlayer();

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = searchStateManager.subscribe(() => {
      setQuery(searchStateManager.query);
      setResults(searchStateManager.results);
      setLoading(searchStateManager.loading);
    });

    return unsubscribe;
  }, []);

  // Update global state when local state changes
  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    searchStateManager.setQuery(newQuery);
  };

  const updateResults = (newResults: Song[]) => {
    setResults(newResults);
    searchStateManager.setResults(newResults);
  };

  const updateLoading = (newLoading: boolean) => {
    setLoading(newLoading);
    searchStateManager.setLoading(newLoading);
  };

  // Mock search function - replace with real YouTube API
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    updateLoading(true);
    try {
      // Mock data for demonstration - replace with actual YouTube API call
      const mockResults: Song[] = [
        {
          id: `${Date.now()}-1`,
          title: 'The Dark Knight Rises Theme - ' + query,
          channel: 'Hans Zimmer',
          duration: '4:32',
          thumbnail: 'https://picsum.photos/320/180?random=1',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          isDownloaded: false,
        },
        {
          id: `${Date.now()}-2`,
          title: 'Batman Begins Soundtrack - ' + query,
          channel: 'Christopher Nolan',
          duration: '3:45',
          thumbnail: 'https://picsum.photos/320/180?random=2',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          isDownloaded: false,
        },
        {
          id: `${Date.now()}-3`,
          title: 'Gotham City Anthem - ' + query,
          channel: 'Epic Music',
          duration: '5:12',
          thumbnail: 'https://picsum.photos/320/180?random=3',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          isDownloaded: false,
        },
      ];
      
      updateResults(mockResults);
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
      updateLoading(false);
    }
  };

  const handleDownload = async (song: Song) => {
    toast({
      title: "DOWNLOAD INITIATED",
      description: `Downloading "${song.title}"...`,
    });
    
    // Mock download process - replace with actual download logic
    setTimeout(() => {
      // Save to localStorage for downloads page
      const savedDownloads = localStorage.getItem('downloadedSongs');
      const downloads = savedDownloads ? JSON.parse(savedDownloads) : [];
      
      const downloadedSong = { ...song, isDownloaded: true, localPath: song.url };
      downloads.push(downloadedSong);
      
      localStorage.setItem('downloadedSongs', JSON.stringify(downloads));
      
      // Update the song in results to show as downloaded
      const updatedResults = results.map(r => 
        r.id === song.id ? { ...r, isDownloaded: true } : r
      );
      updateResults(updatedResults);
      
      toast({
        title: "DOWNLOAD COMPLETE",
        description: `"${song.title}" has been downloaded.`,
      });
    }, 2000);
  };

  const handlePlay = (song: Song, index: number) => {
    playPlaylist(results, index);
  };

  return (
    <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-auto mobile-full-height">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 bat-gradient rounded-lg p-3 sm:p-4 border border-border">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 font-orbitron uppercase tracking-wider text-primary responsive-text-2xl">
          SEARCH MUSIC
        </h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron text-sm"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider px-3 sm:px-4"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto bat-glow"></div>
          <p className="mt-2 text-muted-foreground font-orbitron uppercase tracking-wider text-sm">SCANNING...</p>
        </div>
      )}

      <div className="space-y-3 pb-4">
        {results.map((song, index) => (
          <Card key={song.id} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bat-glow-blue">
            <CardContent className="p-3 sm:p-4">
              <div className="flex gap-3">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover border border-border flex-shrink-0"
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
                      className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs flex-1 sm:flex-none min-w-[80px]"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      PLAY
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(song)}
                      disabled={song.isDownloaded}
                      className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs flex-1 sm:flex-none min-w-[100px]"
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