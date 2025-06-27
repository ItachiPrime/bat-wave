import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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

const DownloadsContext = createContext<DownloadsContextType | undefined>(
  undefined
);

export const useDownloadsContext = () => {
  const ctx = useContext(DownloadsContext);
  if (!ctx)
    throw new Error(
      "useDownloadsContext must be used within DownloadsProvider"
    );
  return ctx;
};

export const DownloadsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [downloads, setDownloads] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // ✅ Memoized fetch
  const fetchDownloads = useCallback(async () => {
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

    const fallbackThumbnail = "/fallback-thumbnail.png";

    const songsWithUrls = await Promise.all(
      (songsData ?? []).map(async (song) => {
        try {
          let audioUrl = "";
          let thumbUrl = fallbackThumbnail;

          const { data: audioSigned } = await supabase.storage
            .from("music")
            .createSignedUrl(song.audio_path, 3600);

          if (!audioSigned?.signedUrl) throw new Error("Audio URL failed");
          audioUrl = audioSigned.signedUrl;

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
        } catch (err) {
          console.warn("Failed to process song", song.id, err);
          return null;
        }
      })
    );

    const validSongs = songsWithUrls.filter((s): s is Song => Boolean(s));
    setDownloads(validSongs);
    setLoading(false);
  }, [userId, toast]);

  useEffect(() => {
    if (!userId) return;

    fetchDownloads(); // Load on mount

    const channel = supabase
      .channel("realtime:songs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "songs",
        },
        (payload) => {
          const newUserId = payload.new?.user_id;
          const oldUserId = payload.old?.user_id;

          // 🔥 Match any update related to the logged-in user
          if (newUserId === userId || oldUserId === userId) {
            fetchDownloads();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchDownloads]);

  return (
    <DownloadsContext.Provider
      value={{ downloads, setDownloads, loading, refetch: fetchDownloads }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};
