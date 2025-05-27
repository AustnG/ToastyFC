import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
    TEAM_NAME, TEAM_LOGO_URL, PRIMARY_COLOR, ACCENT_COLOR, THEME_BLACK,
    MaterialMenuIcon, MaterialCloseIcon,
    MaterialHomeIcon, MaterialTeamIcon, MaterialCalendarIcon, MaterialStatsIcon, MaterialSparklesIcon,
    MaterialClubIcon, MaterialGearIcon, MaterialUsersIcon, MaterialChevronDownIcon,
    MaterialConnectIcon, MaterialDollarIcon, MaterialMailIcon
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
  { path: "/", label: "Home", icon: <MaterialHomeIcon className="mr-2" style={{ fontSize: '20px' }} /> },
  {
    label: "Club",
    icon: <MaterialClubIcon className="mr-2" style={{ fontSize: '20px' }} />,
    children: [
      { path: "/club/about", label: "About", icon: <MaterialTeamIcon className="mr-2" style={{ fontSize: '20px' }} /> },
      { path: "/club/gear", label: "Gear & Setup", icon: <MaterialGearIcon className="mr-2" style={{ fontSize: '20px' }} /> }
    ]
  },
  { path: "/roster", label: "Roster", icon: <MaterialUsersIcon className="mr-2" style={{ fontSize: '20px' }} /> },
  { path: "/fixtures", label: "Fixtures", icon: <MaterialCalendarIcon className="mr-2" style={{ fontSize: '20px' }} /> },
  { path: "/stats", label: "Stats", icon: <MaterialStatsIcon className="mr-2" style={{ fontSize: '20px' }} /> },
  // { path: "/fanzone", label: "Fan Zone", icon: <MaterialSparklesIcon className="mr-2" style={{ fontSize: '20px' }} /> }, // FanZone currently disabled
  {
    label: "Connect",
    icon: <MaterialConnectIcon className="mr-2" style={{ fontSize: '20px' }} />,
    children: [
      { path: "/connect/sponsor", label: "Sponsor", icon: <MaterialDollarIcon className="mr-2" style={{ fontSize: '20px' }} /> },
      { path: "/connect/contact", label: "Contact Us", icon: <MaterialMailIcon className="mr-2" style={{ fontSize: '20px' }} /> },
      // { path: "/connect/contact2", label: "Contact Us V2", icon: <MaterialMailIcon className="mr-2" style={{ fontSize: '20px' }} /> }
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
  const inactiveLinkClasses = `text-neutral-700 hover:bg-[${PRIMARY_COLOR}]/20 hover:text-[${ACCENT_COLOR}]`;
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
            <Link to="/" className="flex items-center" aria-label={`${TEAM_NAME} homepage`}>
              <img src={TEAM_LOGO_URL} alt={`${TEAM_NAME} Logo`} className="h-10 w-auto rounded-full" />
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
                      <MaterialChevronDownIcon className={`ml-1 transition-transform duration-200 ${openDesktopDropdown === item.label ? 'rotate-180' : ''}`} style={{ fontSize: '16px' }} />
                    </button>
                    {openDesktopDropdown === item.label && (
                      <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-20">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setOpenDesktopDropdown(null)}
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
              {isMobileMenuOpen ? <MaterialCloseIcon /> : <MaterialMenuIcon />}
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
                    <MaterialChevronDownIcon className={`transition-transform duration-200 ${openMobileSubmenu === item.label ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }} />
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