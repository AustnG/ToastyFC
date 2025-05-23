
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
    TEAM_NAME, PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK, THEME_WHITE, MenuIcon, CloseIcon, 
    HomeIcon, TeamIcon, CalendarIcon, StatsIcon, SparklesIcon, 
    ClubIcon, GearIcon, UsersIcon, ChevronDownIcon,
    ConnectIcon, DollarIcon, MailIcon
} from '../constants'; 

interface NavSubItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}
interface NavItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: NavSubItem[];
}

const NavItemsList: NavItem[] = [
  { path: "/", label: "Home", icon: <HomeIcon /> },
  {
    label: "Club",
    icon: <ClubIcon />,
    children: [
      { path: "/club/about", label: "About", icon: <TeamIcon /> }, // Updated path
      { path: "/club/gear", label: "Gear & Setup", icon: <GearIcon /> }
    ]
  },
  { path: "/roster", label: "Roster", icon: <UsersIcon /> },
  { path: "/fixtures", label: "Fixtures", icon: <CalendarIcon /> },
  { path: "/stats", label: "Stats", icon: <StatsIcon /> },
  // { path: "/fanzone", label: "Fan Zone", icon: <SparklesIcon /> }, // FanZone currently disabled
  {
    label: "Connect", 
    icon: <ConnectIcon />,
    children: [
      { path: "/connect/sponsor", label: "Sponsor", icon: <DollarIcon /> },
      { path: "/connect/contact", label: "Contact Us", icon: <MailIcon /> }
    ]
  }
];

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const desktopDropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});


  const baseLinkClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150";
  // Inactive links: black text, hover with light primary background and accent text
  const inactiveLinkClasses = `text-neutral-700 hover:bg-[${PRIMARY_COLOR}]/20 hover:text-[${ACCENT_COLOR}]`;
  // Active links: primary background, black text for contrast
  const activeLinkClasses = `bg-[${PRIMARY_COLOR}] text-[${THEME_BLACK}]`;
  
  const mobileLinkClasses = "block px-3 py-2 rounded-md text-base font-medium";
  const mobileSubLinkClasses = "block pl-10 pr-3 py-2 rounded-md text-base font-medium";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setOpenDesktopDropdown(null);
        setOpenMobileSubmenu(null); 
      } else if (openDesktopDropdown) {
        // Check if the click was outside the open dropdown menu and its trigger
        const dropdownContainer = desktopDropdownRefs.current[openDesktopDropdown];
        if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
            setOpenDesktopDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef, openDesktopDropdown]);


  const handleDesktopDropdownToggle = (label: string) => {
    setOpenDesktopDropdown(openDesktopDropdown === label ? null : label);
  };
  
  const toggleMobileSubmenu = (label: string) => {
    setOpenMobileSubmenu(openMobileSubmenu === label ? null : label);
  };

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50`} ref={navRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-bold text-[${PRIMARY_COLOR}]`}>
              {TEAM_NAME} 🔥
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {NavItemsList.map((item) => (
                item.children ? (
                  <div 
                    key={item.label} 
                    className="relative"
                    // Fix: Changed ref callback to use a block statement to ensure correct return type (void).
                    // The assignment expression `desktopDropdownRefs.current[item.label] = el` returns `el`,
                    // which caused a type error as ref callbacks should return void or a cleanup function.
                    ref={el => { desktopDropdownRefs.current[item.label] = el; }}
                  >
                    <button
                      onClick={() => handleDesktopDropdownToggle(item.label)}
                      className={`${baseLinkClasses} ${inactiveLinkClasses} ${openDesktopDropdown === item.label ? `!bg-[${PRIMARY_COLOR}]/20 !text-[${ACCENT_COLOR}]` : ''}`}
                      aria-haspopup="true"
                      aria-expanded={openDesktopDropdown === item.label}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${openDesktopDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDesktopDropdown === item.label && (
                      <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-20">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setOpenDesktopDropdown(null)} // Close dropdown on item click
                            className={({ isActive }) => `block px-4 py-2 text-sm ${isActive ? `font-semibold text-[${ACCENT_COLOR}]` : 'text-neutral-700'} hover:bg-neutral-100 hover:text-neutral-900 flex items-center`}
                          >
                            {child.icon}
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path!}
                    className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                )
              ))}
            </div>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md text-neutral-600 hover:text-[${ACCENT_COLOR}] hover:bg-[${PRIMARY_COLOR}]/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[${PRIMARY_COLOR}]`}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-white shadow-lg pb-3" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NavItemsList.map((item) => (
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMobileSubmenu(item.label)}
                    className={`${mobileLinkClasses} w-full text-left flex items-center justify-between ${inactiveLinkClasses} ${openMobileSubmenu === item.label ? `!bg-[${PRIMARY_COLOR}]/20 !text-[${ACCENT_COLOR}]` : ''}`}
                    aria-expanded={openMobileSubmenu === item.label}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${openMobileSubmenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openMobileSubmenu === item.label && (
                    <div className="pl-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setOpenMobileSubmenu(null);
                          }}
                          className={({ isActive }) => `${mobileSubLinkClasses} flex items-center ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                        >
                          {child.icon}
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `${mobileLinkClasses} flex items-center ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;