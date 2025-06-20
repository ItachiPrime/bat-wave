import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, Play } from "lucide-react";
import { Song } from "@/types/music";
import { useToast } from "@/hooks/use-toast";
import { usePlayer } from "@/hooks/usePlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { useSearchContext } from "@/context/SearchContext";
import { useAuth } from "@/hooks/useAuth";
import { useUploadManager } from "@/context/UploadManagerContext";

const SearchPage: React.FC = () => {
  const { query, setQuery, results, setResults } = useSearchContext();
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { playSingleSong } = usePlayer();
  const { addTask, setProgress, setCurrentFile } = useUploadManager();

  const COMMON_AUDIO_FOLDER = "songs";
  const COMMON_THUMBNAIL_FOLDER = "thumbnails";

  // --- Add mounted ref to prevent setState on unmounted ---
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  //

  useEffect(() => {
    (async () => {
      // No need to set userId here; it's derived from useAuth()
      await supabase.auth.getUser();
    })();
  }, []);

  // Search Functionality
  const handleSearch = async () => {
    if (!query.trim()) return;
    if (mounted.current) setLoading(true);
    if (mounted.current) setResults([]);
    try {
      const resp = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
          query
        )}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      const json = await resp.json();
      if (!resp.ok || json.error)
        throw new Error(json.error?.message || "YouTube API error");
      const items = json.items || [];

      const songResults: Song[] = items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        duration: "0:00",
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        isDownloaded: false,
      }));

      if (!songResults.length) {
        if (mounted.current) setResults([]);
        toast({
          title: "NO RESULTS",
          description: "No songs found.",
        });
        if (mounted.current) setLoading(false);
        return;
      }

      const ids = songResults.map((s) => s.id).join(",");
      const detailsResp = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${
          import.meta.env.VITE_YOUTUBE_API_KEY
        }`
      );
      const detailsJson = await detailsResp.json();
      const details = detailsJson.items || [];

      const getDur = (iso: string) => {
        const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const h = parseInt(match?.[1] || "0", 10);
        const m = parseInt(match?.[2] || "0", 10);
        const s = parseInt(match?.[3] || "0", 10);
        return h > 0
          ? `${h}:${m.toString().padStart(2, "0")}:${s
              .toString()
              .padStart(2, "0")}`
          : `${m}:${s.toString().padStart(2, "0")}`;
      };

      let downloadedIds: string[] = [];
      if (userId) {
        const { data: downloaded, error } = await supabase
          .from("songs")
          .select("id")
          .eq("user_id", userId);
        if (!error && downloaded) {
          downloadedIds = downloaded.map((d: any) => d.id);
        }
      }

      if (mounted.current) {
        setResults(
          songResults.map((s) => {
            const detail = details.find((d: any) => d.id === s.id);
            return {
              ...s,
              duration: detail
                ? getDur(detail.contentDetails.duration)
                : "0:00",
              isDownloaded: downloadedIds.includes(s.id),
            };
          })
        );
        toast({
          title: "SEARCH COMPLETE",
          description: `Found ${items.length} results`,
        });
      }
    } catch (err: any) {
      toast({
        title: "SEARCH ERROR",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const sanitizeFileName = (title: string) =>
    title
      .replace(/[\/\\?%*:|"<>]/g, "")
      .replace(/[^\w\s]/gi, "_")
      .replace(/\s+/g, "_")
      .trim();

  // Download Logic
  const handleDownload = async (song: Song) => {
    if (!userId) {
      toast({
        title: "DOWNLOAD ERROR",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    if (mounted.current) setProcessingId(song.id);
    if (mounted.current) setUploadingId(song.id);

    const filename = `${sanitizeFileName(song.title)}.mp3`;
    const audioStoragePath = `${COMMON_AUDIO_FOLDER}/${filename}`;

    try {
      // Check if audio already exists in common folder
      const { data: fileList, error: listErr } = await supabase.storage
        .from("music")
        .list(COMMON_AUDIO_FOLDER, { search: filename });

      let fileExists = false;
      if (
        !listErr &&
        fileList &&
        fileList.some((f: any) => f.name === filename)
      ) {
        fileExists = true;
      }

      if (!fileExists) {
        // Download and upload audio
        const rapidUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${song.id}`;
        const r = await fetch(rapidUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
          },
        });
        const j = await r.json();
        if (!j.link) throw new Error(j.msg || "No download link");

        const blobResp = await fetch(j.link);
        const blob = await blobResp.blob();

        const { error: uploadErr } = await supabase.storage
          .from("music")
          .upload(audioStoragePath, blob, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (uploadErr) throw uploadErr;
      }

      // Handle thumbnail in common folder
      let thumbnailStoragePath: string | null = null;
      if (song.thumbnail) {
        try {
          const thumbResp = await fetch(song.thumbnail);
          const thumbBlob = await thumbResp.blob();
          const thumbExt =
            song.thumbnail.split(".").pop()?.split("?")[0] || "jpg";
          const thumbFilename = `${sanitizeFileName(song.title)}.${thumbExt}`;
          thumbnailStoragePath = `${COMMON_THUMBNAIL_FOLDER}/${thumbFilename}`;
          const { data: thumbList, error: thumbListErr } =
            await supabase.storage
              .from("music")
              .list(COMMON_THUMBNAIL_FOLDER, { search: thumbFilename });
          let thumbExists = false;
          if (
            !thumbListErr &&
            thumbList &&
            thumbList.some((f: any) => f.name === thumbFilename)
          ) {
            thumbExists = true;
          }
          if (!thumbExists) {
            const { error: thumbErr } = await supabase.storage
              .from("music")
              .upload(thumbnailStoragePath, thumbBlob, {
                contentType: thumbBlob.type || "image/jpeg",
                upsert: true,
              });
            if (thumbErr) {
              console.warn("Thumbnail upload failed:", thumbErr.message);
              thumbnailStoragePath = null;
            }
          }
        } catch (e) {
          console.warn("Thumbnail fetch/upload failed:", e);
        }
      }

      // Always insert a new row for this user, referencing the common audio/thumbnail
      await supabase.from("songs").upsert([
        {
          id: song.id,
          user_id: userId,
          title: song.title,
          channel: song.channel,
          duration: song.duration,
          thumbnail: thumbnailStoragePath,
          audio_path: audioStoragePath,
          created_at: new Date().toISOString(),
        },
      ]);

      if (mounted.current) {
        setResults(
          results.map((s: Song) =>
            s.id === song.id ? { ...s, isDownloaded: true } : s
          )
        );
        toast({
          title: "DOWNLOADED",
          description: `Saved "${song.title}"`,
        });
      }
    } catch (err: any) {
      toast({
        title: "DOWNLOAD ERROR",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
      console.log("Download error:", err);
    } finally {
      if (mounted.current) setProcessingId(null);
      if (mounted.current) setUploadingId(null);
    }
  };

  // Playback Logic (downloads/uploads if needed)
  const handlePlay = async (song: Song, index: number) => {
    if (!userId) {
      toast({
        title: "PLAYBACK ERROR",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    if (mounted.current) setProcessingId(song.id);

    const filename = `${sanitizeFileName(song.title)}.mp3`;
    const audioStoragePath = `${COMMON_AUDIO_FOLDER}/${filename}`;

    const { data: signedData, error: signErr } = await supabase.storage
      .from("music")
      .createSignedUrl(audioStoragePath, 3600);

    let playbackUrl = signedData?.signedUrl;

    if (signErr || !playbackUrl) {
      try {
        const rapidUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${song.id}`;
        const r = await fetch(rapidUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
          },
        });
        const j = await r.json();
        if (!j.link) throw new Error(j.msg || "No download link");

        playbackUrl = j.link;

        playSingleSong({
          ...song,
          audioUrl: playbackUrl,
          duration: song.duration,
        });

        // Move upload logic to UploadManager
        addTask(async () => {
          try {
            setCurrentFile(song.title);
            // Fetch the file as a blob with progress
            const response = await fetch(j.link);
            const reader = response.body?.getReader();
            const contentLength = +response.headers.get("Content-Length")!;
            let received = 0;
            const chunks = [];
            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;
              chunks.push(value);
              received += value.length;
              setProgress(Math.round((received / contentLength) * 100));
            }
            const blob = new Blob(chunks, { type: "audio/mpeg" });
            await supabase.storage
              .from("music")
              .upload(audioStoragePath, blob, {
                contentType: "audio/mpeg",
                upsert: true,
              });

            let thumbnailStoragePath: string | null = null;
            if (song.thumbnail) {
              try {
                const thumbResp = await fetch(song.thumbnail);
                const thumbBlob = await thumbResp.blob();
                const thumbExt =
                  song.thumbnail.split(".").pop()?.split("?")[0] || "jpg";
                const thumbFilename = `${sanitizeFileName(
                  song.title
                )}.${thumbExt}`;
                thumbnailStoragePath = `${COMMON_THUMBNAIL_FOLDER}/${thumbFilename}`;
                await supabase.storage
                  .from("music")
                  .upload(thumbnailStoragePath, thumbBlob, {
                    contentType: thumbBlob.type || "image/jpeg",
                    upsert: true,
                  });
              } catch (e) {
                thumbnailStoragePath = null;
              }
            }

            await supabase.from("songs").upsert([
              {
                id: song.id,
                user_id: userId,
                title: song.title,
                channel: song.channel,
                duration: song.duration,
                thumbnail: thumbnailStoragePath,
                audio_path: audioStoragePath,
                created_at: new Date().toISOString(),
              },
            ]);

            if (mounted.current) {
              setResults(
                results.map((s: Song) =>
                  s.id === song.id ? { ...s, isDownloaded: true } : s
                )
              );
            }
          } catch (err) {
            // handle error if needed
          } finally {
            setProgress(0);
            setCurrentFile(null);
            if (mounted.current) setUploadingId(null);
          }
        });

        if (mounted.current) setProcessingId(null);
        return;
      } catch (err: any) {
        toast({
          title: "PLAYBACK ERROR",
          description: err.message || "Unknown error",
          variant: "destructive",
        });
        if (mounted.current) setProcessingId(null);
        return;
      }
    }

    // Always upsert a row for this user if playbackUrl exists
    try {
      // Check if the song already exists for this user
      const { data: existingRows, error: selectError } = await supabase
        .from("songs")
        .select("id")
        .eq("user_id", userId)
        .eq("id", song.id)
        .maybeSingle();

      if (!existingRows) {
        let thumbnailStoragePath: string | null = null;
        if (song.thumbnail) {
          const thumbExt = song.thumbnail.split(".").pop()?.split("?")[0] || "jpg";
          const thumbFilename = `${sanitizeFileName(song.title)}.${thumbExt}`;
          thumbnailStoragePath = `${COMMON_THUMBNAIL_FOLDER}/${thumbFilename}`;
        }
        await supabase.from("songs").upsert([
          {
            id: song.id,
            user_id: userId,
            title: song.title,
            channel: song.channel,
            duration: song.duration,
            thumbnail: thumbnailStoragePath,
            audio_path: audioStoragePath,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      if (mounted.current) {
        setResults(
          results.map((s: Song) =>
            s.id === song.id ? { ...s, isDownloaded: true } : s
          )
        );
      }
    } catch (err) {
      // Optionally handle error
    }

    playSingleSong({ ...song, audioUrl: playbackUrl, duration: song.duration });
    if (mounted.current) setProcessingId(null);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-4 bat-gradient rounded-lg p-3 sm:p-4 border border-border mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 font-orbitron uppercase tracking-wider text-primary responsive-text-2xl">
          SEARCH MUSIC
        </h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-bat-grey border-border focus:border-primary focus:bat-glow font-orbitron text-sm"
            disabled={loading}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bat-glow hover:animate-glow-pulse font-orbitron uppercase tracking-wider px-3 sm:px-4"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></span>
              </span>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto bat-glow"></div>
          <p className="mt-2 text-muted-foreground font-orbitron uppercase tracking-wider text-sm">
            SCANNING...
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {results.map((song, index) => (
          <Card
            key={song.id}
            className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bat-glow-blue"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex gap-3">
                <img
                  src={song.thumbnail || "/fallback-thumbnail.png"}
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
                      disabled={processingId === song.id}
                    >
                      {processingId === song.id ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></span>
                        </span>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          PLAY
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(song)}
                      disabled={
                        song.isDownloaded ||
                        processingId === song.id ||
                        uploadingId === song.id
                      }
                      className="border-primary/30 hover:border-primary hover:bat-glow font-orbitron uppercase text-xs flex-1 sm:flex-none min-w-[100px]"
                    >
                      {uploadingId === song.id ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></span>
                          UPLOADING
                        </span>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          {song.isDownloaded ? "DOWNLOAD" : "DOWNLOAD"}
                        </>
                      )}
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
