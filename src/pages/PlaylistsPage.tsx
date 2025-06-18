
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Music } from 'lucide-react';
import { Playlist } from '@/types/music';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useToast } from '@/hooks/use-toast';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { playPlaylist } = useAudioPlayer();
  const { toast } = useToast();

  useEffect(() => {
    // Load playlists from localStorage
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: [],
      createdAt: new Date(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    
    setNewPlaylistName('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "PLAYLIST CREATED",
      description: `"${newPlaylistName}" has been created.`,
    });
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      playPlaylist(playlist.songs, 0);
    } else {
      toast({
        title: "EMPTY PLAYLIST",
        description: "This playlist doesn't have any songs yet.",
      });
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between bat-gradient rounded-lg p-4 border border-border">
        <h1 className="text-2xl font-bold font-orbitron uppercase tracking-wider text-primary">
          PLAYLISTS
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-2" />
              CREATE PLAYLIST
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-orbitron uppercase tracking-wider text-primary">
                CREATE NEW PLAYLIST
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-border hover:border-primary font-orbitron uppercase"
                >
                  CANCEL
                </Button>
                <Button 
                  onClick={createPlaylist} 
                  disabled={!newPlaylistName.trim()}
                  className="bat-glow font-orbitron uppercase"
                >
                  CREATE
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-orbitron uppercase tracking-wider">NO PLAYLISTS YET</p>
            <p className="text-sm font-orbitron">Create your first playlist to organize your music</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id} 
              className="cursor-pointer hover:shadow-md transition-all duration-300 bg-card border-border hover:border-primary/50 hover:bat-glow-blue"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg truncate font-orbitron uppercase tracking-wider">
                  {playlist.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-orbitron">
                  {playlist.songs.length} SONG{playlist.songs.length !== 1 ? 'S' : ''}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider" 
                  variant="outline" 
                  onClick={() => handlePlayPlaylist(playlist)}
                  disabled={playlist.songs.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  PLAY PLAYLIST
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
