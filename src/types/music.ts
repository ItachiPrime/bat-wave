
export interface Song {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url?: string;
  localPath?: string;
  isDownloaded: boolean;
  downloadProgress?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
  thumbnail?: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Song[];
  currentIndex: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}
