// Example: src/hooks/useMusicControls.ts
import { useEffect } from "react";

export function useMusicControls(currentSong, isPlaying, onPlay, onPause, onNext, onPrev) {
  useEffect(() => {
    // @ts-ignore
    const MusicControls = window.MusicControls;
    if (!MusicControls || !currentSong) return;

    MusicControls.create({
      track: currentSong.title,
      artist: currentSong.channel,
      cover: currentSong.thumbnail,
      isPlaying: isPlaying,
      dismissable: false,
      hasPrev: true,
      hasNext: true,
      hasClose: false,
    });

    MusicControls.subscribe((action: any) => {
      switch (action) {
        case 'music-controls-next': onNext(); break;
        case 'music-controls-previous': onPrev(); break;
        case 'music-controls-pause': onPause(); break;
        case 'music-controls-play': onPlay(); break;
      }
    });

    MusicControls.listen();

    return () => {
      MusicControls.destroy();
    };
  }, [currentSong, isPlaying, onPlay, onPause, onNext, onPrev]);
}