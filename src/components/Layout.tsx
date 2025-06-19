import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Download, Music, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MusicPlayer from '@/components/MusicPlayer';
import Navbar from '@/components/Navbar';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVh();
  window.addEventListener('resize', setVh);

  return () => {
    window.removeEventListener('resize', setVh);
  };
}, []);

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      navigate(tab === 'search' ? '/' : `/${tab}`, { replace: true });
    }
  };

  const tabs = [
    { key: 'search', icon: Search, label: 'SEARCH' },
    { key: 'downloads', icon: Download, label: 'DOWNLOADS' },
    { key: 'playlists', icon: Music, label: 'PLAYLISTS' },
    { key: 'now-playing', icon: Play, label: 'NOW PLAYING' },
  ];

  useEffect(() => {
    const path = location.pathname;
    let newTab = 'search';

    if (path.startsWith('/downloads')) newTab = 'downloads';
    else if (path.startsWith('/playlists')) newTab = 'playlists';
    else if (path.startsWith('/now-playing')) newTab = 'now-playing';
    else if (path === '/') newTab = 'search';

    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  return (
    <div className="flex flex-col bg-background text-foreground overflow-hidden" style={{ height: 'calc(var(--vh) * 100)' }}>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Music Player Always at Bottom, except on Now Playing page */}
      {location.pathname !== '/now-playing' && <MusicPlayer />}

      {/* Bottom Navigation for Mobile */}
      <nav className="border-t border-border bg-card/80 backdrop-blur-sm p-2 safe-area-padding-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          <Button
            variant={activeTab === 'now-playing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('now-playing')}
            className={`flex-col h-auto py-2 px-2 sm:px-2 gap-1 font-orbitron text-xs uppercase tracking-wider min-h-[60px] w-full ${
              activeTab === 'now-playing' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs">PLAYING</span>
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('search')}
            className={`flex-col h-auto py-2 px-2 sm:px-2 gap-1 font-orbitron text-xs uppercase tracking-wider min-h-[60px] w-full ${
              activeTab === 'search' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs">SEARCH</span>
          </Button>
          <Button
            variant={activeTab === 'downloads' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('downloads')}
            className={`flex-col h-auto py-2 px-2 sm:px-2 gap-1 font-orbitron text-xs uppercase tracking-wider min-h-[60px] w-full ${
              activeTab === 'downloads' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs">DOWNLOADS</span>
          </Button>
          <Button
            variant={activeTab === 'playlists' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('playlists')}
            className={`flex-col h-auto py-2 px-2 sm:px-3 gap-1 font-orbitron text-xs uppercase tracking-wider min-h-[60px] w-full ${
              activeTab === 'playlists' ? 'bat-glow text-primary-foreground' : 'hover:bat-glow-blue'
            }`}
          >
            <Music className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-[10px] sm:text-xs">PLAYLISTS</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;