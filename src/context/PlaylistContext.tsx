import React, { createContext, useContext, useState, useEffect } from "react";
import { Playlist, Song } from "@/types/music";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface PlaylistContextType {
  playlists: Playlist[];
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylistContext = () => {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylistContext must be used within PlaylistProvider");
  return ctx;
};

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch playlists and their songs for the user
  const fetchPlaylists = async () => {
    if (!userId) return;
    // Fetch playlists
    const { data: playlistsData, error: playlistsError } = await supabase
      .from("playlists")
      .select("id, name, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (playlistsError) {
      toast({
        title: "Fetch Error",
        description: playlistsError.message,
        variant: "destructive",
      });
      setPlaylists([]);
      return;
    }
    // Fetch playlist_songs join table
    const { data: playlistSongsData, error: playlistSongsError } = await supabase
      .from("playlist_songs")
      .select("playlist_id, song_id, order")
      .in("playlist_id", (playlistsData ?? []).map((p: any) => p.id));
    if (playlistSongsError) {
      toast({
        title: "Fetch Error",
        description: playlistSongsError.message,
        variant: "destructive",
      });
      setPlaylists([]);
      return;
    }
    // Fetch all songs referenced in playlists
    const allSongIds = Array.from(new Set((playlistSongsData ?? []).map((ps: any) => ps.song_id)));
    let songsMap: Record<string, Song> = {};
    if (allSongIds.length > 0) {
      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select("id, title, channel, duration, thumbnail, audio_path")
        .in("id", allSongIds);
      if (!songsError && songsData) {
        // Get signed URLs for audio and thumbnail
        const fallbackThumbnail = "/fallback-thumbnail.png";
        const songsWithUrls = await Promise.all(
          songsData.map(async (song: any) => {
            let audioUrl = "";
            let thumbUrl = fallbackThumbnail;
            if (song.audio_path) {
              const { data: audioSigned } = await supabase.storage
                .from("music")
                .createSignedUrl(song.audio_path, 3600);
              if (audioSigned?.signedUrl) audioUrl = audioSigned.signedUrl;
            }
            if (song.thumbnail) {
              const { data: thumbSigned } = await supabase.storage
                .from("music")
                .createSignedUrl(song.thumbnail, 3600);
              if (thumbSigned?.signedUrl) thumbUrl = thumbSigned.signedUrl;
            }
            return {
              id: song.id,
              title: song.title,
              channel: song.channel,
              duration: song.duration,
              thumbnail: thumbUrl,
              audioUrl,
              isDownloaded: true,
            };
          })
        );
        songsMap = Object.fromEntries(songsWithUrls.map((s) => [s.id, s]));
      }
    }
    // Build playlists with songs
    const playlistsWithSongs: Playlist[] = (playlistsData ?? []).map((p: any) => {
      const songLinks = (playlistSongsData ?? [])
        .filter((ps: any) => ps.playlist_id === p.id)
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      const songs = songLinks.map((ps: any) => songsMap[ps.song_id]).filter(Boolean);
      return {
        id: p.id,
        name: p.name,
        songs,
        createdAt: p.created_at,
      };
    });
    setPlaylists(playlistsWithSongs);
  };

  useEffect(() => {
    if (userId) fetchPlaylists();
    // eslint-disable-next-line
  }, [userId]);

  // Create playlist
  const createPlaylist = async (name: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("playlists")
      .insert([{ name, user_id: userId, created_at: new Date().toISOString() }]);
    if (error) {
      toast({
        title: "Create Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    await fetchPlaylists();
  };

  // Delete playlist
  const deletePlaylist = async (playlistId: string) => {
    await supabase.from("playlist_songs").delete().eq("playlist_id", playlistId);
    await supabase.from("playlists").delete().eq("id", playlistId);
    await fetchPlaylists();
  };

  // Rename playlist
  const renamePlaylist = async (playlistId: string, newName: string) => {
    await supabase.from("playlists").update({ name: newName }).eq("id", playlistId);
    await fetchPlaylists();
  };

  // Add song to playlist
  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    // Find current max order
    const { data: currentLinks } = await supabase
      .from("playlist_songs")
      .select("order")
      .eq("playlist_id", playlistId);
    const maxOrder = currentLinks && currentLinks.length > 0 ? Math.max(...currentLinks.map((l: any) => l.order ?? 0)) : 0;
    await supabase.from("playlist_songs").insert([
      { playlist_id: playlistId, song_id: song.id, order: maxOrder + 1 },
    ]);
    await fetchPlaylists();
  };

  // Remove song from playlist
  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    await supabase.from("playlist_songs").delete().eq("playlist_id", playlistId).eq("song_id", songId);
    await fetchPlaylists();
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        setPlaylists,
        addSongToPlaylist,
        removeSongFromPlaylist,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        refetch: fetchPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};