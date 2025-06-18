// src/App.tsx
// (Keep all imports as they are, no changes needed there)

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Layout from "@/components/Layout";
import NotFound from "./pages/NotFound";

import SearchPage from "./pages/SearchPage";
import DownloadsPage from "./pages/DownloadsPage";
import NowPlayingPage from "./pages/NowPlayingPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import AuthPage from "./pages/AuthPage"; // Make sure AuthPage is imported

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Sonner /> {/* Sonner can remain here or be moved to main.tsx too if preferred */}
        <BrowserRouter>
          <Routes>
            {/* This is the crucial change:
              The AuthPage route MUST be placed OUTSIDE of the ProtectedRoute.
              It should be directly under Routes.
            */}
            <Route path="/auth" element={<AuthPage />} /> {/* <--- MOVED THIS LINE HERE */}

            {/* All main pages wrapped in layout + protection */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<SearchPage />} />
              {/* REMOVED: <Route path="/auth" element={<AuthPage />} /> from here */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/now-playing" element={<NowPlayingPage />} />
            </Route>

            {/* Catch-all - Keep this at the very end */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;