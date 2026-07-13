"use client"
import Link from "next/link";
import { jersey25 } from "./fonts";
import { User, Search } from "@deemlol/next-icons";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import Searchbar from "@/components/Searchbar";
import { usePathname } from "next/navigation";

const NavLink = ({ href, children, isActive }: { href: string, children: React.ReactNode, isActive: boolean }) => (
    <Link href={href} className="relative group px-3 py-2">
        <h5 className={`${jersey25.className} text-2xl tracking-wide transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-400 group-hover:text-white'}`}>
            {children}
        </h5>
        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500 transition-all duration-300 ${isActive ? 'w-3/4 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-0 group-hover:w-3/4'}`}></div>
    </Link>
);

const Navbar = () => {
    const user = useAuthStore((state) => state.user);
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener("scroll", handleScroll);
        // Check on mount
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${
            isScrolled 
            ? "bg-[#090c10]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl py-3" 
            : "bg-[#0d1117] py-6"
        }`}>
            <div className="w-[95%] max-w-7xl mx-auto px-4 md:px-0 flex flex-wrap items-center justify-between gap-3">
                
                {/* Logo and Nav Links */}
                <div className="flex flex-wrap items-center gap-3 md:gap-10 min-w-0">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] group-hover:scale-105 transition-all duration-300 transform -rotate-3 group-hover:rotate-0">
                            <span className="text-white font-black text-2xl drop-shadow-md">C</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                            CineVault
                        </h1>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-4 ml-4">
                        <NavLink href="/" isActive={pathname === "/"}>Home</NavLink>
                        <NavLink href="/discover" isActive={pathname === "/discover"}>Discover</NavLink>
                        <NavLink href="/tv-series" isActive={pathname === "/tv-series"}>TV Shows</NavLink>
                        <NavLink href="/about-us" isActive={pathname === "/about-us"}>About Us</NavLink>
                    </nav>
                </div>

                {/* Search, user actions, and mobile menu */}
                <div className="flex items-center gap-4 md:gap-12">
                    <div className="hidden lg:block w-80">
                        <Searchbar />
                    </div>

                    <button
                        type="button"
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
                                className={`flex items-center gap-2 p-1.5 rounded-[1.25rem] transition-all duration-300 border-2 ${open ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'}`}
                            >
                                <div className="bg-gradient-to-br from-blue-400 to-purple-500 w-9 h-9 rounded-full flex items-center justify-center shadow-inner">
                                    <User size={20} color="#ffffff" strokeWidth={2} />
                                </div>
                                <svg className={`w-4 h-4 text-gray-300 mr-2 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 mt-4 w-64 bg-[#121820]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 transform origin-top-right transition-all duration-300 ${open ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                                <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                                    <p className="text-sm font-bold text-white truncate drop-shadow-sm">{user.email}</p>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    <Link
                                        href="/profile"
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-4 group"
                                        onClick={() => setOpen(false)}
                                    >
                                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <User size={18} strokeWidth={2.5} />
                                        </div>
                                        Your Profile
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-4 group"
                                    >
                                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        </div>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="group">
                            <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] group-hover:-translate-y-0.5 text-sm sm:text-base">
                                <User size={20} strokeWidth={2.5} />
                                <span className="tracking-wide">Sign In</span>
                            </div>
                        </Link>
                    )}
                </div>

                <div className={`md:hidden mt-2 w-full ${menuOpen ? 'block' : 'hidden'}`}>
                    <div className="rounded-3xl border border-white/10 bg-[#0d1117] shadow-2xl p-4 space-y-3">
                        <Link href="/" className="block px-4 py-3 rounded-2xl text-white text-sm font-semibold hover:bg-white/10" onClick={() => setMenuOpen(false)}>Home</Link>
                        <Link href="/discover" className="block px-4 py-3 rounded-2xl text-white text-sm font-semibold hover:bg-white/10" onClick={() => setMenuOpen(false)}>Discover</Link>
                        <Link href="/tv-series" className="block px-4 py-3 rounded-2xl text-white text-sm font-semibold hover:bg-white/10" onClick={() => setMenuOpen(false)}>TV Shows</Link>
                        <Link href="/about-us" className="block px-4 py-3 rounded-2xl text-white text-sm font-semibold hover:bg-white/10" onClick={() => setMenuOpen(false)}>About Us</Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
