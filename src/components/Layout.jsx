import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, CalendarCheck, Settings, Menu, X, ChevronRight } from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (e) => {
            setScrolled(e.target.scrollTop > 20);
        };
        const main = document.querySelector('main');
        if (main) main.addEventListener('scroll', handleScroll);
        return () => main?.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/meeting", icon: <CalendarCheck size={20} />, label: "Meeting" },
        { to: "/simulator", icon: <TrendingUp size={20} />, label: "Simulator" },
    ];

    const isFullBleed = location.pathname === '/meeting' || location.pathname === '/simulator';

    return (
        <div className="app-container font-sans bg-[#FDFBF7] min-h-screen flex overflow-hidden">
            {/* Sidebar - Desktop (Pixel Perfect) */}
            <aside className="hidden lg:flex w-[280px] bg-white border-r border-slate-100 flex-col py-10 px-8 h-screen sticky top-0 shrink-0 z-50">
                <div className="flex items-center gap-4 mb-16 group cursor-pointer">
                    <div className="w-10 h-10 bg-[#FF8c42] rounded-2xl shadow-xl shadow-orange-200 flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
                        <TrendingUp size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none uppercase">ANGKASA</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise</p>
                    </div>
                </div>
                
                <nav className="flex-1 space-y-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => 
                                `flex items-center justify-between group px-5 py-4 rounded-[20px] text-sm font-bold transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-x-2' 
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`
                            }
                        >
                            <div className="flex items-center gap-4">
                                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${location.pathname === item.to ? 'hidden' : ''}`} />
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-10 border-t border-slate-50">
                    <button className="flex items-center gap-4 px-5 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 w-full transition-all rounded-2xl hover:bg-slate-50 group">
                        <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen relative overflow-hidden bg-[#FDFBF7]">
                {/* Global Mobile Header */}
                <header className={`lg:hidden flex items-center justify-between px-6 py-5 bg-white transition-all duration-300 z-[60] ${scrolled ? 'shadow-lg py-4' : 'border-b border-slate-50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF8c42] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <TrendingUp size={16} className="text-white" />
                        </div>
                        <span className="font-black text-slate-800 tracking-tighter text-base uppercase">ANGKASA</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600 active:scale-90 transition-transform"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* Content Container */}
                <main className={`flex-1 overflow-y-auto custom-scrollbar relative transition-all duration-500 ${isFullBleed ? 'p-0' : 'p-0'}`}>
                    <div className={`${isFullBleed ? 'h-full w-full' : 'max-w-[1440px] mx-auto px-8 lg:px-16 py-10 lg:py-16 animate-in'}`}>
                        <Outlet />
                    </div>
                    {/* Safe Area for Mobile Nav */}
                    <div className="lg:hidden h-28 shrink-0" />
                </main>
            </div>

            {/* Mobile Menu Overlay (Drawer Style) */}
            <div className={`lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
                <aside className={`w-[80%] max-w-[320px] bg-white h-full p-10 flex flex-col shadow-2xl transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-10 h-10 bg-[#FF8c42] rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200">
                            <TrendingUp size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">ANGKASA</h1>
                    </div>
                    <nav className="space-y-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => 
                                    `flex items-center gap-5 px-6 py-5 rounded-2xl text-base font-bold transition-all ${
                                        isActive ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'text-slate-400'
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>
            </div>

            {/* Floating Quick Navigation (Mobile Only) */}
            <nav className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm h-16 glass-card rounded-[24px] shadow-float flex items-center justify-around px-6 z-[60] border border-white/20">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#FF8c42] -translate-y-1 scale-110' : 'text-slate-400 opacity-50'}`}
                    >
                        {item.icon}
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
