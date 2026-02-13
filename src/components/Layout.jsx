import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wrench, Settings } from 'lucide-react';

const Layout = () => {
    const navItems = [
        { to: "/", icon: <LayoutDashboard size={24} />, label: "Dashboard" },
        { to: "/tools", icon: <Wrench size={24} />, label: "Tools" },
    ];

    return (
        <div className="app-container">
            {/* Sidebar - Desktop */}
            <aside className="sidebar">
                <div className="logo-area">
                    <h1 className="text-xl" style={{ color: 'var(--color-primary)' }}>MyCompany</h1>
                </div>
                <nav className="nav-desktop">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Bottom Nav - Mobile */}
            <nav className="bottom-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <style>{`
        .sidebar {
          width: 250px;
          background: white;
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
        }
        
        .logo-area {
          margin-bottom: 2rem;
          padding-left: 1rem;
        }

        .nav-desktop {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background-color: var(--color-bg-main);
          color: var(--color-primary);
        }

        .nav-item.active {
          background-color: #FFFAF0; /* Light Orange/Cream */
          color: var(--color-primary);
          font-weight: 600;
        }

        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: white;
          border-top: 1px solid var(--color-border);
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          text-decoration: none;
        }
        
        .bottom-nav-item.active {
          color: var(--color-primary);
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          .bottom-nav {
            display: flex;
          }
          .main-content {
            padding-bottom: 90px;
          }
        }
      `}</style>
        </div>
    );
};

export default Layout;
