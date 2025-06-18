
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Download, Music, Play } from 'lucide-react';
import SearchPage from '@/pages/SearchPage';
import DownloadsPage from '@/pages/DownloadsPage';
import PlaylistsPage from '@/pages/PlaylistsPage';
import NowPlayingPage from '@/pages/NowPlayingPage';
import MusicPlayer from '@/components/MusicPlayer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Tabs defaultValue="search" className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <TabsContent value="search" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <SearchPage />
          </TabsContent>
          <TabsContent value="downloads" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <DownloadsPage />
          </TabsContent>
          <TabsContent value="playlists" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <PlaylistsPage />
          </TabsContent>
          <TabsContent value="now-playing" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <NowPlayingPage />
          </TabsContent>
        </div>
        
        {/* Mini Player */}
        <MusicPlayer />
        
        {/* Bottom Navigation */}
        <TabsList className="grid w-full grid-cols-4 rounded-none h-16 bg-card border-t">
          <TabsTrigger value="search" className="flex flex-col gap-1 py-2">
            <Search className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex flex-col gap-1 py-2">
            <Download className="h-5 w-5" />
            <span className="text-xs">Downloads</span>
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex flex-col gap-1 py-2">
            <Music className="h-5 w-5" />
            <span className="text-xs">Playlists</span>
          </TabsTrigger>
          <TabsTrigger value="now-playing" className="flex flex-col gap-1 py-2">
            <Play className="h-5 w-5" />
            <span className="text-xs">Now Playing</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default Layout;
