
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { user, signOut } = useAuth();

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
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center bat-glow">
            <span className="text-primary-foreground font-bold text-sm font-orbitron">B</span>
          </div>
          <h1 className="text-xl font-bold font-orbitron uppercase tracking-wider text-primary">
            BATWAVE
          </h1>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 p-0 rounded-full hover:bg-transparent focus:bg-transparent focus:ring-0 hover:ring-0 active:bg-transparent active:ring-0 ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <Avatar className="h-10 w-10 border-2 border-primary rounded-full">
                <AvatarImage
                  src="/public/bat.png"
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
