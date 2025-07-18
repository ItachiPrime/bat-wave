import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Download } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayer } from "@/hooks/usePlayerContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDownloadsContext } from "@/context/DownloadsContext";
import { useAuth } from "@/hooks/useAuth";

const fallbackThumbnail = "/fallback-thumbnail.png";

const DownloadsPage = () => {
  const { downloads, setDownloads, loading, refetch } = useDownloadsContext();
  const { playPlaylist } = usePlayer();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // Play a single song from the downloads list, but as part of the playlist
  const handlePlay = (song: Song, index: number) => {
    if (!downloads[index]?.audioUrl) {
      toast({
        title: "Playback Error",
        description: "Audio URL missing for this song.",
        variant: "destructive",
      });
      return;
    }
    playPlaylist(downloads, index);
  };

  // Play all songs in the downloads list as a playlist
  const playAll = () => {
    if (downloads.length > 0 && downloads[0].audioUrl) {
      playPlaylist(downloads, 0);
    } else {
      toast({
        title: "Playback Error",
        description: "No valid songs to play.",
        variant: "destructive",
      });
    }
  };

  // Delete song from Supabase storage and table
  const handleDelete = async (songId: string) => {
    if (loading) return;
    const song = downloads.find((s) => s.id === songId);
    if (!song || !userId) return;

    try {
      await supabase
        .from("songs")
        .delete()
        .eq("id", songId)
        .eq("user_id", userId);

      setDownloads((prev) => prev.filter((s) => s.id !== songId));

      toast({
        title: "SONG DELETED",
        description: "Song has been removed from downloads.",
      });
    } catch (err: any) {
      toast({
        title: "DELETE ERROR",
        description: err.message || "Failed to delete song.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 bat-gradient rounded-lg p-3 sm:p-4 border border-border mb-4 flex justify-between items-center">
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

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto bat-glow"></div>
          <p className="mt-2 text-muted-foreground font-orbitron uppercase tracking-wider text-sm">
            LOADING DOWNLOADS...
          </p>
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-orbitron uppercase tracking-wider responsive-text-lg">
              NO DOWNLOADED SONGS YET
            </p>
            <p className="text-sm font-orbitron mt-2">
              Search and download songs to see them here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {downloads.map((song, index) => (
            <Card
              key={song.id}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bat-glow-blue"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3">
                  <img
                    src={song.thumbnail || fallbackThumbnail}
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
                        disabled={loading}
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
