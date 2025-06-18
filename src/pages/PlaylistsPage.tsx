
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
      title: "Playlist Created",
      description: `"${newPlaylistName}" has been created.`,
    });
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      playPlaylist(playlist.songs, 0);
    } else {
      toast({
        title: "Empty Playlist",
        description: "This playlist doesn't have any songs yet.",
      });
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPlaylist} disabled={!newPlaylistName.trim()}>
                  Create
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
            <p>No playlists yet</p>
            <p className="text-sm">Create your first playlist to organize your music</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => handlePlayPlaylist(playlist)}
                  disabled={playlist.songs.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play Playlist
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
