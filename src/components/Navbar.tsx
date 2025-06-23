import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, ArrowUpToLine, ArrowUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUploadManager } from "@/context/UploadManagerContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { uploading, progress, currentFile } = useUploadManager();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center bat-glow">
            <img src="/logo.png" className='rounded-full w-8 h-8'/>
          </div>
          <h1 className="text-xl font-bold font-orbitron uppercase tracking-wider text-primary">
            BATWAVE
          </h1>
        </div>

        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="flex items-center ml-24">
            <div className="relative flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#facc15" // Tailwind yellow-400
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={
                    2 * Math.PI * 16 * (1 - progress / 100)
                  }
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s' }}
                />
              </svg>
              <span className="absolute w-8 h-8 flex items-center justify-center">
                <ArrowUp className="text-yellow-400 w-5 h-5" />
              </span>
            </div>
          </div>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 p-0 rounded-full hover:bg-transparent focus:bg-transparent focus:ring-0 hover:ring-0 active:bg-transparent active:ring-0 ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Avatar className="h-9 w-9 border-2 border-primary rounded-full">
                <AvatarImage
                  src="/bat.png"
                  alt='User Avatar'
                />
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-card/95 backdrop-blur-sm border-border bat-border"
            align="end"
            forceMount
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium font-orbitron uppercase tracking-wide text-primary">
                Dark Knight
              </p>
              <p className="text-xs text-muted-foreground font-orbitron truncate">
                {user?.email}
              </p>
            </div>
            
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive font-orbitron uppercase text-xs tracking-wider"
            >
              <LogOut className="mr-2 h-4 w-4" />
              LOGOUT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
