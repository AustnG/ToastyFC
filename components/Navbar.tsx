import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LOGO_URL_ROUNDED } from '../constants';

// --- DESKTOP COMPONENTS (UNCHANGED) ---
const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
        isActive ? 'bg-surface text-primary' : 'text-gray-600 hover:bg-surface hover:text-accent'
      }`
    }
  >
    {children}
  </NavLink>
);

const Dropdown: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-surface hover:text-accent focus:outline-none transition-colors duration-300 flex items-center">
        {title}
        <span className={`material-symbols-rounded transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>expand_more</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-surface ring-1 ring-black ring-opacity-5" onClick={() => setIsOpen(false)}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <NavLink to={to} className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-primary bg-background' : 'text-gray-700'} hover:bg-background hover:text-accent w-full text-left transition-colors duration-200`} role="menuitem">
        {children}
    </NavLink>
);


// --- MOBILE COMPONENTS (NEW) ---
const MobileNavItem: React.FC<{ to: string; children: React.ReactNode; onClick: () => void }> = ({ to, children, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 ${
          isActive ? 'bg-background text-primary' : 'text-gray-800 hover:bg-background hover:text-accent'
        }`
      }
    >
      {children}
    </NavLink>
);

const MobileDropdown: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="py-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-4 py-3 rounded-lg text-lg font-semibold text-gray-800 hover:bg-background hover:text-accent transition-colors duration-200 text-left"
            >
                <span>{title}</span>
                <span className={`material-symbols-rounded transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
             {isOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-border ml-2">
                    {children}
                </div>
            )}
        </div>
    );
};

const MobileDropdownItem: React.FC<{ to: string; children: React.ReactNode; onClick: () => void }> = ({ to, children, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `block px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-gray-700 hover:bg-background hover:text-accent'
            }`
        }
    >
        {children}
    </NavLink>
);


// --- MAIN NAVBAR COMPONENT ---
const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Effect to lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
        document.body.classList.add('overflow-hidden');
    } else {
        document.body.classList.remove('overflow-hidden');
    }
    return () => {
        document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);
  
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 shadow-md shadow-gray-900/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3" onClick={mobileMenuOpen ? closeMobileMenu : undefined}>
                <img className="h-12 w-12" src={LOGO_URL_ROUNDED} alt="Toasty FC Logo" />
                <span className="font-bold text-xl text-accent tracking-wider">TOASTY FC</span>
              </Link>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavItem to="/">Home</NavItem>
                <Dropdown title="Club">
                  <DropdownItem to="/club/about">About</DropdownItem>
                  <DropdownItem to="/club/gear">Gear & Setup</DropdownItem>
                </Dropdown>
                <NavItem to="/roster">Roster</NavItem>
                <NavItem to="/fixtures">Fixtures</NavItem>
                <NavItem to="/stats">Stats</NavItem>
                <Dropdown title="Connect">
                  <DropdownItem to="/connect/sponsor">Sponsor</DropdownItem>
                  <DropdownItem to="/connect/contact">Contact</DropdownItem>
                </Dropdown>
              </div>
            </div>
            {/* Mobile Nav Trigger */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-accent hover:bg-background focus:outline-none">
                <span className="material-symbols-rounded text-3xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU BACKDROP --- */}
      <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
      ></div>

      {/* --- MOBILE MENU PANEL --- */}
      <aside
          className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
      >
          <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 id="mobile-menu-title" className="font-bold text-xl text-primary">Menu</h2>
              <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:text-accent transition-colors">
                  <span className="material-symbols-rounded text-3xl">close</span>
              </button>
          </div>
          <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
              <MobileNavItem to="/" onClick={closeMobileMenu}>Home</MobileNavItem>
              <MobileDropdown title="Club">
                  <MobileDropdownItem to="/club/about" onClick={closeMobileMenu}>About</MobileDropdownItem>
                  <MobileDropdownItem to="/club/gear" onClick={closeMobileMenu}>Gear & Setup</MobileDropdownItem>
              </MobileDropdown>
              <MobileNavItem to="/roster" onClick={closeMobileMenu}>Roster</MobileNavItem>
              <MobileNavItem to="/fixtures" onClick={closeMobileMenu}>Fixtures</MobileNavItem>
              <MobileNavItem to="/stats" onClick={closeMobileMenu}>Stats</MobileNavItem>
              <MobileDropdown title="Connect">
                  <MobileDropdownItem to="/connect/sponsor" onClick={closeMobileMenu}>Sponsor</MobileDropdownItem>
                  <MobileDropdownItem to="/connect/contact" onClick={closeMobileMenu}>Contact</MobileDropdownItem>
              </MobileDropdown>
          </nav>
      </aside>
    </>
  );
};

export default Navbar;