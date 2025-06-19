import React, { createContext, useContext, useRef, useState } from "react";

type UploadTask = () => Promise<void>;

type UploadManagerType = {
  addTask: (task: UploadTask) => void;
  uploading: boolean;
  progress: number;
  currentFile: string | null;
  setProgress: (p: number) => void;
  setCurrentFile: (f: string | null) => void;
};

const UploadManagerContext = createContext<UploadManagerType | undefined>(undefined);

export const useUploadManager = () => {
  const ctx = useContext(UploadManagerContext);
  if (!ctx) throw new Error("useUploadManager must be used within UploadManagerProvider");
  return ctx;
};

export const UploadManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queue = useRef<UploadTask[]>([]);
  const running = useRef(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const runNext = async () => {
    if (running.current || queue.current.length === 0) return;
    running.current = true;
    setUploading(true);
    const task = queue.current.shift();
    if (task) await task();
    setUploading(false);
    setProgress(0);
    setCurrentFile(null);
    running.current = false;
    if (queue.current.length > 0) runNext();
  };

  const addTask = (task: UploadTask) => {
    queue.current.push(task);
    runNext();
  };

  return (
    <UploadManagerContext.Provider value={{
      addTask,
      uploading,
      progress,
      currentFile,
      setProgress,
      setCurrentFile
    }}>
      {children}
    </UploadManagerContext.Provider>
  );
};