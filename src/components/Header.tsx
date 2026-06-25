/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, X, Database, Sun, Moon, Youtube, Instagram, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isSynced: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function Header({ currentTab, setCurrentTab, isSynced, theme, setTheme }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'club', label: 'Club' },
    { id: 'roster', label: 'Roster' },
    { id: 'matches', label: 'Match Results' },
    { id: 'stats', label: 'Club Stats' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-club-border bg-club-card/85 backdrop-blur-md transition-colors duration-200" id="app-header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            className="flex cursor-pointer items-center space-x-2.5" 
            onClick={() => setCurrentTab('home')}
            id="brand-logo"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-jersey-gold/30 shadow-[0_0_15px_rgba(170,0,0,0.1)]">
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpr_-jtzGa9qA4MOAbwPfBKXsXw5PdEbejZINByEzJLOjUrf-T0RvqBKaqcR7mJH5IfHY6okFTBalO-EAvvT_IqZNpvT8DEKsHkgB75tZ5GeAUriRR0WNYXohCcbnkWwD8qyBT3R3aLGpwIWIApdBB-IVqgfcnOibDUUEpqEBuCZjM2DIWICY1ojvPCwU/s98/2025_Logo_rounded.png" 
                alt="Toasty FC Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-sans text-base sm:text-lg font-black tracking-tight text-club-text">
                TOASTY <span className="text-jersey-red">FC</span>
              </span>
              <p className="font-mono text-[9px] tracking-widest text-club-text-dim uppercase leading-none">
                Est. 2022
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1" id="desktop-nav">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-jersey-red bg-jersey-red/5 border-b-2 border-jersey-red font-bold'
                      : 'text-club-text-muted hover:text-club-text hover:bg-club-card-hover'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side controls: Social Links, Sync Status, Theme, Mobile Toggle */}
          <div className="flex items-center space-x-2.5 sm:space-x-3" id="header-right-controls">
            
            {/* Desktop Social Icons */}
            <div className="hidden sm:flex items-center space-x-1.5 border-r border-club-border pr-2.5 mr-1" id="social-header-links">
              <a 
                href="https://www.youtube.com/@ToastyFC" 
                target="_blank" 
                rel="noopener noreferrer"
                title="YouTube Channel"
                className="p-1.5 rounded-lg text-club-text-muted hover:text-red-500 hover:bg-club-card-hover transition"
              >
                <Youtube className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://www.instagram.com/toastyfc" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram Profile"
                className="p-1.5 rounded-lg text-club-text-muted hover:text-pink-500 hover:bg-club-card-hover transition"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a 
                href="https://discord.gg/toastyfc" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Discord Community"
                className="p-1.5 rounded-lg text-club-text-muted hover:text-indigo-400 hover:bg-club-card-hover transition"
              >
                {/* Custom inline Discord SVG icon */}
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.71-1.32,2.51-2a75.4,75.4,0,0,0,72.78,0c.8.71,1.64,1.39,2.51,2a68.41,68.41,0,0,1-10.45,5,77.67,77.67,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.82,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              </a>
            </div>

            {/* Sheets Database Sync Switcher Button */}
            <button
              onClick={() => setCurrentTab(currentTab === 'sync' ? 'home' : 'sync')}
              className={`p-2 rounded-xl border transition duration-200 relative group cursor-pointer ${
                currentTab === 'sync'
                  ? 'bg-jersey-red/10 border-jersey-red text-jersey-red'
                  : isSynced 
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10'
                    : 'bg-club-card-hover border-club-border text-club-text-muted hover:text-club-text'
              }`}
              title="Google Sheets Sync Settings"
              id="header-sync-switcher"
            >
              <Database className="h-4.5 w-4.5" />
              {isSynced && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-club-card" />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-club-border bg-club-card-hover hover:bg-club-card text-club-text-muted hover:text-club-text transition duration-200 cursor-pointer"
              aria-label="Toggle visual theme"
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun className="h-4.5 w-4.5 text-jersey-gold" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-jersey-red" />
              )}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center" id="mobile-menu-btn-container">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-club-text-muted hover:bg-club-card-hover hover:text-club-text focus:outline-hidden cursor-pointer"
                aria-controls="mobile-menu"
                aria-expanded="false"
                id="mobile-menu-toggle"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-club-border bg-club-card" id="mobile-menu">
          <div className="space-y-1 px-2.5 pb-3.5 pt-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-tab-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-jersey-red bg-jersey-red/5 font-bold'
                      : 'text-club-text-muted hover:bg-club-card-hover hover:text-club-text'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Mobile Social Links row */}
            <div className="flex items-center justify-around pt-3 mt-2 border-t border-club-border/40">
              <a href="https://www.youtube.com/@ToastyFC" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs font-semibold text-club-text-dim hover:text-red-500">
                <Youtube className="h-4 w-4" />
                <span>YouTube</span>
              </a>
              <a href="https://www.instagram.com/toastyfc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs font-semibold text-club-text-dim hover:text-pink-500">
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a href="https://discord.gg/toastyfc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs font-semibold text-club-text-dim hover:text-indigo-400">
                <span className="text-sm">💬</span>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
