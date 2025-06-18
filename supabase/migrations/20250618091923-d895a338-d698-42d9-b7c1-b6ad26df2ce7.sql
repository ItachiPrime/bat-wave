
-- Create a profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create songs table for downloads
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  duration TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  video_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Songs policies
CREATE POLICY "Users can view their own songs" 
  ON public.songs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own songs" 
  ON public.songs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" 
  ON public.songs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Users can view their own playlists" 
  ON public.playlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" 
  ON public.playlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
  ON public.playlists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
  ON public.playlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on playlist_songs
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Playlist songs policies
CREATE POLICY "Users can view songs in their playlists" 
  ON public.playlist_songs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add songs to their playlists" 
  ON public.playlist_songs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove songs from their playlists" 
  ON public.playlist_songs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists 
      WHERE playlists.id = playlist_songs.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
