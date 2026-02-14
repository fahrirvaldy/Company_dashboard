import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wrench, Settings } from 'lucide-react';
import './Layout.css';

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
                    <h1 className="text-xl">MyCompany</h1>
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
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;

