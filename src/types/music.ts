export interface Song {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  isDownloaded?: boolean;
  url?: string;
  localPath?: string; // <-- add this
  audioUrl?: string;  // <-- optional, for future
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
  thumbnail?: string;
}

export type RepeatMode = "none" | "one" | "all";

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Song[];
  isSingleSong?: boolean;
  currentIndex: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}
