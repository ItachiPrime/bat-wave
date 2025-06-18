
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MusicPlayer from '@/components/MusicPlayer';
import SearchPage from '@/pages/SearchPage';
import DownloadsPage from '@/pages/DownloadsPage';
import PlaylistsPage from '@/pages/PlaylistsPage';
import NowPlayingPage from '@/pages/NowPlayingPage';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('search')) return 'search';
    if (path.includes('downloads')) return 'downloads';
    if (path.includes('playlists')) return 'playlists';
    if (path.includes('now-playing')) return 'now-playing';
    return 'search';
  };

  const activeTab = getActiveTab();

  const setActiveTab = (tab: string) => {
    navigate(`/${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'downloads':
        return <DownloadsPage />;
      case 'playlists':
        return <PlaylistsPage />;
      case 'now-playing':
        return <NowPlayingPage />;
      default:
        return <SearchPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center bat-glow">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <h1 className="text-xl font-bold font-orbitron uppercase tracking-wider text-primary">
            BAT-MUSIC
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Music Player */}
      <MusicPlayer />

      {/* Bottom Navigation */}
      <nav className="border-t border-border bg-card/80 backdrop-blur-sm p-2">
        <div className="flex justify-around">
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className={`flex-col h-auto py-2 px-3 gap-1 font-orbitron text-xs uppercase tracking-wider ${
              activeTab === 'search' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Search className="h-5 w-5" />
            SEARCH
          </Button>
          <Button
            variant={activeTab === 'downloads' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('downloads')}
            className={`flex-col h-auto py-2 px-3 gap-1 font-orbitron text-xs uppercase tracking-wider ${
              activeTab === 'downloads' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Download className="h-5 w-5" />
            DOWNLOADS
          </Button>
          <Button
            variant={activeTab === 'playlists' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('playlists')}
            className={`flex-col h-auto py-2 px-3 gap-1 font-orbitron text-xs uppercase tracking-wider ${
              activeTab === 'playlists' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Music className="h-5 w-5" />
            PLAYLISTS
          </Button>
          <Button
            variant={activeTab === 'now-playing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('now-playing')}
            className={`flex-col h-auto py-2 px-3 gap-1 font-orbitron text-xs uppercase tracking-wider ${
              activeTab === 'now-playing' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Play className="h-5 w-5" />
            NOW PLAYING
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
