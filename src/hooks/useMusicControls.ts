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

  // 👇 Add refs for callbacks to always have latest
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

  // ✅ Set up listener ONCE on mount, but use refs for callbacks
  useEffect(() => {
    const listener = CapacitorMusicControls.addListener(
      "musicControlsAction",
      (event) => {
        console.log("🎧 musicControlsAction:", event.action);
        switch (event.action) {
          case "play":
            playRef.current();
            break;
          case "pause":
            pauseRef.current();
            break;
          case "next":
            nextRef.current();
            break;
          case "previous":
            prevRef.current();
            break;
          default:
            console.warn("Unhandled musicControlsAction:", event.action);
        }
      }
    );

    return () => {
      listener.remove(); // Clean on unmount
    };
  }, []); // Only run once

  // 🔄 Only update/create when song changes
  useEffect(() => {
    if (!currentSong) return;

    const trackKey = `${currentSong.title}|${currentSong.channel}|${currentSong.thumbnail}`;

    if (lastTrackRef.current !== trackKey) {
      lastTrackRef.current = trackKey;

      (async () => {
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
      })().catch((e) => console.error("MusicControls.create error:", e));
    }
  }, [currentSong?.title, currentSong?.channel, currentSong?.thumbnail]);

  // 🔁 Keep isPlaying in sync
  useEffect(() => {
    if (!currentSong) return;
    CapacitorMusicControls.updateIsPlaying({ isPlaying });
  }, [isPlaying, currentSong]);
}