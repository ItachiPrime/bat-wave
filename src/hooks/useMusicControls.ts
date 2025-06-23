import { useEffect, useRef } from "react";
import { CapacitorMusicControls } from "capacitor-music-controls-plugin";

interface Song {
  title: string;
  channel: string;
  thumbnail: string;
}

export function useMusicControls(
  currentSong: Song | null,
  isPlaying: boolean,
  onPlay: () => void,
  onPause: () => void,
  onNext: () => void,
  onPrev: () => void
) {
  const lastTrackRef = useRef<string>("");

  // Use refs to always get latest callbacks
  const playRef = useRef(onPlay);
  const pauseRef = useRef(onPause);
  const nextRef = useRef(onNext);
  const prevRef = useRef(onPrev);

  useEffect(() => {
    playRef.current = onPlay;
    pauseRef.current = onPause;
    nextRef.current = onNext;
    prevRef.current = onPrev;
  }, [onPlay, onPause, onNext, onPrev]);

  // 🎯 Main handler for all control events
  const handleControlsEvent = (info: { message?: string }) => {
    const message = info.message;
    console.log("🎧 handleControlsEvent received:", message);

    switch (message) {
      case "music-controls-play":
        playRef.current?.();
        break;
      case "music-controls-pause":
        pauseRef.current?.();
        break;
      case "music-controls-next":
        nextRef.current?.();
        break;
      case "music-controls-previous":
        prevRef.current?.();
        break;
      case "music-controls-destroy":
        pauseRef.current?.();
        break;
      default:
        console.warn("❓ Unhandled music control:", message);
    }
  };

  // ✅ Setup BOTH listeners: iOS and Android 13+
  useEffect(() => {
    const iosListener = CapacitorMusicControls.addListener(
      "controlsNotification",
      (info) => {
        console.log("📲 iOS/Old Android control fired:", info);
        handleControlsEvent(info);
      }
    );

    const androidListener = (event: any) => {
      const message =
        event?.message || event?.detail?.message || "unknown-event";
      console.log("🤖 Android 13+ control fired:", message);
      handleControlsEvent({ message });
    };

    document.addEventListener("controlsNotification", androidListener);

    return () => {
      iosListener.remove();
      document.removeEventListener("controlsNotification", androidListener);
    };
  }, []);

  // 🆕 Create or update controls when song changes
  useEffect(() => {
    if (!currentSong) return;

    const trackKey = `${currentSong.title}|${currentSong.channel}|${currentSong.thumbnail}`;
    if (lastTrackRef.current === trackKey) return;

    lastTrackRef.current = trackKey;

    (async () => {
      try {
        await CapacitorMusicControls.destroy();
        await CapacitorMusicControls.create({
          track: currentSong.title,
          artist: currentSong.channel,
          cover: currentSong.thumbnail,
          isPlaying,
          dismissable: true,
          hasPrev: true,
          hasNext: true,
          hasClose: false,
          playIcon: "media_play",
          pauseIcon: "media_pause",
          prevIcon: "media_prev",
          nextIcon: "media_next",
          notificationIcon: "notification",
          ticker: `Now playing "${currentSong.title}"`,
        });
      } catch (err) {
        console.error("MusicControls.create error:", err);
      }
    })();
  }, [currentSong?.title, currentSong?.channel, currentSong?.thumbnail]);

  // 🔁 Sync play/pause toggle
  useEffect(() => {
    if (!currentSong) return;
    CapacitorMusicControls.updateIsPlaying({ isPlaying }).catch((err) =>
      console.error("updateIsPlaying error:", err)
    );
  }, [isPlaying, currentSong]);
}
