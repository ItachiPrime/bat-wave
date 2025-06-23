import React, { createContext, useContext, useState, useEffect } from "react";
import { Song } from "@/types/music";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type DownloadsContextType = {
  downloads: Song[];
  setDownloads: React.Dispatch<React.SetStateAction<Song[]>>;
  loading: boolean;
  refetch: () => Promise<void>;
};

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const useDownloadsContext = () => {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error("useDownloadsContext must be used within DownloadsProvider");
  return ctx;
};

export const DownloadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  const fetchDownloads = async () => {
    if (!userId) return;
    setLoading(true);
    const { data: songsData, error: songsError } = await supabase
      .from("songs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (songsError) {
      toast({
        title: "Fetch Error",
        description: songsError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Get signed URLs for audio and thumbnail
    const fallbackThumbnail = "/fallback-thumbnail.png";
    const songsWithUrls = await Promise.all(
      (songsData ?? []).map(async (song) => {
        let audioUrl = "";
        let thumbUrl = fallbackThumbnail;

        if (song.audio_path) {
          const { data: audioSigned } = await supabase.storage
            .from("music")
            .createSignedUrl(song.audio_path, 3600);
          if (audioSigned?.signedUrl) {
            audioUrl = audioSigned.signedUrl;
          } else {
            return null;
          }
        } else {
          return null;
        }

        if (song.thumbnail) {
          const { data: thumbSigned } = await supabase.storage
            .from("music")
            .createSignedUrl(song.thumbnail, 3600);
          if (thumbSigned?.signedUrl) {
            thumbUrl = thumbSigned.signedUrl;
          }
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

    const validSongs = songsWithUrls.filter(Boolean) as Song[];
    setDownloads(validSongs);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchDownloads();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <DownloadsContext.Provider value={{ downloads, setDownloads, loading, refetch: fetchDownloads }}>
      {children}
    </DownloadsContext.Provider>
  );
};