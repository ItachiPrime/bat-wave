import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Play,
  Music,
  Edit,
  Trash2,
  X,
  Edit2Icon,
  PlayIcon,
  PlaySquare,
} from "lucide-react";
import { usePlaylistContext } from "@/context/PlaylistContext";
import { useDownloadsContext } from "@/context/DownloadsContext";
import { usePlayer } from "@/hooks/usePlayerContext";
import { useToast } from "@/hooks/use-toast";
import { Song } from "@/types/music";

const fallbackThumbnail = "/logo.png";

const PlaylistsPage = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
  } = usePlaylistContext();
  const { downloads } = useDownloadsContext();
  const { playPlaylist } = usePlayer();
  const { toast } = useToast();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editSongsId, setEditSongsId] = useState<string | null>(null);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);

  const handlePlayPlaylist = (playlistSongs: Song[]) => {
    if (playlistSongs.length > 0) {
      playPlaylist(playlistSongs, 0);
    } else {
      toast({
        title: "EMPTY PLAYLIST",
        description: "This playlist doesn't have any songs yet.",
      });
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-auto mobile-full-height">
      <div className="flex items-center justify-between bat-gradient rounded-lg p-3 sm:p-4 border border-border">
        <h1 className="text-xl sm:text-2xl font-bold font-orbitron uppercase tracking-wider text-primary responsive-text-2xl">
          PLAYLISTS
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider text-xs sm:text-sm px-3 sm:px-4">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">CREATE PLAYLIST</span>
              <span className="sm:hidden">CREATE</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-orbitron uppercase tracking-wider text-primary text-sm sm:text-base">
                CREATE NEW PLAYLIST
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  newPlaylistName.trim() &&
                  (() => {
                    createPlaylist(newPlaylistName.trim());
                    setNewPlaylistName("");
                    setIsCreateDialogOpen(false);
                    toast({
                      title: "PLAYLIST CREATED",
                      description: `"${newPlaylistName}" has been created.`,
                    });
                  })()
                }
                className="bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-border hover:border-primary font-orbitron uppercase text-xs"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={() => {
                    if (!newPlaylistName.trim()) return;
                    createPlaylist(newPlaylistName.trim());
                    setNewPlaylistName("");
                    setIsCreateDialogOpen(false);
                    toast({
                      title: "PLAYLIST CREATED",
                      description: `"${newPlaylistName}" has been created.`,
                    });
                  }}
                  disabled={!newPlaylistName.trim()}
                  className="bat-glow font-orbitron uppercase text-xs"
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
            <p className="font-orbitron uppercase tracking-wider responsive-text-lg">
              NO PLAYLISTS YET
            </p>
            <p className="text-sm font-orbitron mt-2">
              Create your first playlist to organize your music
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col pb-4 gap-3">
          {playlists.map((playlist) => {
            // Use the first song's thumbnail as playlist cover, or fallback
            const cover = playlist.songs[0]?.thumbnail || fallbackThumbnail;
            return (
              <Card
                key={playlist.id}
                className="bg-card shadow-lg rounded-lg overflow-hidden flex gap-4 items-center p-3 relative"
              >
                {/* Playlist Cover */}
                <div className="w-14 h-14 shrink-0 rounded overflow-hidden relative">
                  <img
                    src={cover}
                    alt={playlist.name}
                    className="w-full h-full object-cover rounded"
                  />
                  {playlist.songs.length >= 1 && (
                    <Button
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             z-50 rounded-full bg-primary hover:bg-primary 
             text-black shadow w-2 h-2 p-2"
                      onClick={() => handlePlayPlaylist(playlist.songs)}
                    >
                      <PlayIcon className="w-2 h-2 p-1" />
                    </Button>
                  )}
                </div>

                {/* Playlist Details */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base sm:text-lg font-orbitron uppercase tracking-wide truncate pt-2">
                      {playlist.name}
                    </CardTitle>
                    <div className="flex items-center flex-row gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="font-orbitron uppercase tracking-wider text-xs text-primary w-11 h-10 rounded-lg"
                        onClick={() => setEditSongsId(playlist.id)}
                      >
                        <Edit2Icon />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="font-orbitron uppercase tracking-wider text-xs w-11 h-10 rounded-lg"
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Edit Songs Dialog */}
                {editSongsId === playlist.id && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-sm rounded-lg p-4 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center">
                        <h2 className="font-orbitron uppercase text-sm">
                          Edit Songs
                        </h2>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditSongsId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <span className="text-xs font-orbitron text-muted-foreground">
                          Add Downloaded Songs:
                        </span>
                        <div className="mt-1 space-y-2">
                          {downloads
                            .filter(
                              (s) =>
                                !playlist.songs.some((ps) => ps.id === s.id)
                            )
                            .map((song) => (
                              <div
                                key={song.id}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <img
                                    src={song.thumbnail}
                                    alt={song.title}
                                    className="w-8 h-8 rounded object-cover border border-border"
                                  />
                                  <span className="truncate text-xs">
                                    {song.title}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    setAddingSongId(song.id);
                                    await addSongToPlaylist(playlist.id, song);
                                    setAddingSongId(null);
                                  }}
                                >
                                  { addSongToPlaylist ? "Adding" :"Add"}
                                </Button>
                              </div>
                            ))}
                          {downloads.filter(
                            (s) => !playlist.songs.some((ps) => ps.id === s.id)
                          ).length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No more songs to add.
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-orbitron text-muted-foreground">
                          Playlist Songs:
                        </span>
                        <div className="mt-1 space-y-2">
                          {playlist.songs.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No songs in playlist.
                            </span>
                          )}
                          {playlist.songs.map((song) => (
                            <div
                              key={song.id}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={song.thumbnail || fallbackThumbnail}
                                  alt={song.title}
                                  className="w-8 h-8 rounded object-cover border border-border"
                                />
                                <span className="truncate text-xs">
                                  {song.title}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  removeSongFromPlaylist(playlist.id, song.id)
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
