import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AudioPlayerProvider } from "@/hooks/usePlayerContext"; // Correct path
import Layout from "@/components/Layout";
import NotFound from "./pages/NotFound";

import SearchPage from "./pages/SearchPage";
import DownloadsPage from "./pages/DownloadsPage";
import NowPlayingPage from "./pages/NowPlayingPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import AuthPage from "./pages/AuthPage"; // Make sure AuthPage is imported
import { useEffect } from "react";
import { SearchProvider } from "@/context/SearchContext";
import { UploadManagerProvider } from "@/context/UploadManagerContext";
import { DownloadsProvider } from "./context/DownloadsContext";
import { PlaylistProvider } from "./context/PlaylistContext";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AudioPlayerProvider>
            <Sonner />
            <PlaylistProvider>
            <DownloadsProvider>
              <SearchProvider>
                <UploadManagerProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route
                        element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<SearchPage />} />
                        <Route path="/downloads" element={<DownloadsPage />} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route
                          path="/now-playing"
                          element={<NowPlayingPage />}
                        />
                        <Route
                          path="/search"
                          element={<Navigate to="/" replace />}
                        />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </UploadManagerProvider>
              </SearchProvider>
            </DownloadsProvider>
            </PlaylistProvider>
          </AudioPlayerProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
