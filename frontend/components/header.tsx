"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Plus, Calendar, Tag, Home } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary-600">
              LocalLoop
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary-600 flex items-center ${
              isActive("/") ? "text-primary-600" : "text-muted-foreground"
            }`}
          >
            <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
          <Link
            href="/events"
            className={`text-sm font-medium transition-colors hover:text-primary-600 flex items-center ${
              isActive("/events") ? "text-primary-600" : "text-muted-foreground"
            }`}
          >
            <Calendar className="mr-1 h-4 w-4" />
            Events
          </Link>
          <Link
            href="/deals"
            className={`text-sm font-medium transition-colors hover:text-primary-600 flex items-center ${
              isActive("/deals") ? "text-primary-600" : "text-muted-foreground"
            }`}
          >
            <Tag className="mr-1 h-4 w-4" />
            Deals
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/submit">
            <Button
              variant="default"
              size="sm"
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New</span>
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
