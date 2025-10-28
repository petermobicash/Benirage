import { useState, useEffect } from 'react';
import { Home, Heart, BookOpen, Users, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Heart, label: 'Spiritual', path: '/spiritual' },
    { icon: BookOpen, label: 'Philosophy', path: '/philosophy' },
    { icon: Users, label: 'Community', path: '/get-involved' },
    { icon: Settings, label: 'More', path: '/resources' },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className={isActive ? 'text-blue-600' : 'text-gray-500'} />
              <span className={`mobile-nav-label ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;