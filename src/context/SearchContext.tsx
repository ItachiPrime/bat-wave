import React, { createContext, useContext, useState } from "react";
import { Song } from "@/types/music";

type SearchContextType = {
  query: string;
  setQuery: (q: string) => void;
  results: Song[];
  setResults: (r: Song[]) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used within SearchProvider");
  return ctx;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, setResults }}>
      {children}
    </SearchContext.Provider>
  );
};