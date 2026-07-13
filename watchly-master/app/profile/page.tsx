"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import axios from 'axios';
import { useQueries } from '@tanstack/react-query';
import MovieCard from '@/components/MovieCard';
import { ChevronLeft, ChevronRight } from '@deemlol/next-icons';

function PaginatedMovieGrid({ items, emptyMessage, onSuccess }: { items: any[], emptyMessage: string, onSuccess?: () => void }) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [jumpPage, setJumpPage] = useState("1");

    // reset page when items change
    useEffect(() => {
        setCurrentPage(1);
        setJumpPage("1");
    }, [items]);

    useEffect(() => {
        setJumpPage(currentPage.toString());
    }, [currentPage]);

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
    const visibleItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const queries = useQueries({
        queries: visibleItems.map(item => ({
            queryKey: ['mediaDetail', item.mediaType || 'movie', item.movieid],
            queryFn: async () => {
                try {
                    // Route to correct API endpoint
                    const isTv = item.mediaType === 'tv-series' || item.mediaType === 'tvseries';
                    const apiEndpoint = isTv ? `/api/tvseries/${item.movieid}` : `/api/movies/${item.movieid}`;

                    const res = await axios.get(apiEndpoint);
                    return { ...res.data, __mediaType: item.mediaType || 'movie' };
                } catch (e) {
                    return null; // Handle API error gracefully
                }
            },
            staleTime: 1000 * 60 * 5, // cache for 5 min
        }))
    });

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center opacity-80 mt-10 h-full">
                <svg className="w-20 h-20 text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v6h6v10H6z" />
                    <circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="14" y1="16" x2="17" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <h2 className="text-lg font-bold text-white mb-1">No content available</h2>
                <p className="text-gray-400 text-[13px]">{emptyMessage}</p>
            </div>
        );
    }

    const handleJumpPage = () => {
        let p = parseInt(jumpPage);
        if (isNaN(p) || p < 1) p = 1;
        if (p > totalPages) p = totalPages;
        if (p !== currentPage) setCurrentPage(p);
        else setJumpPage(currentPage.toString());
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex gap-6 w-full justify-center flex-wrap">
                {queries.map((q, idx) => {
                    if (q.isLoading) return <div key={idx} className="w-[180px] h-[270px] bg-white/5 border border-white/10 animate-pulse rounded-xl shadow-lg"></div>;
                    if (!q.data) return null;
                    const item = q.data;
                    const originalItem = visibleItems[idx];
                    return (
                        <MovieCard
                            key={`${item.id}-${originalItem.status}`}
                            id={item.id}
                            title={item.title || item.original_title || item.name}
                            posterUrl={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            overview={item.overview}
                            releaseDate={item.release_date || item.first_air_date}
                            mediaType={item.__mediaType === 'tvseries' ? 'tv-series' : item.__mediaType}
                            currentStatus={originalItem.status}
                            onSuccess={onSuccess}
                        />
                    );
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex gap-4 py-12 items-center justify-center w-full mt-auto">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-3 bg-[#1c1c1c] rounded-xl disabled:opacity-40 hover:bg-[#252525] transition-all shadow-lg border border-[#333] group"
                    >
                        <ChevronLeft size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                    </button>

                    <div className="flex items-center gap-3 bg-[#1c1c1c] px-5 py-2.5 rounded-xl shadow-lg border border-[#333]">
                        <span className="text-gray-400 font-medium">Page</span>
                        <input
                            type="text"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                            onBlur={handleJumpPage}
                            className="w-12 text-center bg-[#2a2a2a] rounded-lg py-1 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <span className="text-gray-400 font-medium">of {totalPages}</span>
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-3 bg-[#1c1c1c] rounded-xl disabled:opacity-40 hover:bg-[#252525] transition-all shadow-lg border border-[#333] group"
                    >
                        <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Profile() {
    const [activeTab, setActiveTab] = useState('Home');
    const { user, profile } = useAuthStore();
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const tabs = ['Home', 'Watched', 'Watchlist'];

    const fetchWatchlist = async () => {
        const { data, error } = await supabase.from('watchlist').select('*');
        if (error) {
            alert(error.message);
            return;
        }
        // console.log(data);
        setWatchlist(data);
    }
    const watchedmovies = watchlist.filter((item) => item.status == "watched")
    const watchingmovies = watchlist.filter((item) => item.status == "watching")
    const watchlistedmovies = watchlist.filter((item) => item.status == "watchlist")
    useEffect(() => {
        fetchWatchlist();
    }, [user]);

    const username = profile?.username || user?.user_metadata?.username || 'user';
    const avatar = profile?.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=4ade80";
    // console.log(avatar);
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
                {/* Header section */}
                <div className="w-full max-w-7xl mx-auto px-6 pt-10 pb-0">
                    <div className="flex justify-between items-start mb-8">
                        {/* User Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800">
                                {/* Avatar */}
                                <img src={avatar} alt="Avatar" className="object-cover w-full h-full" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{username}</h1>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Link href="/profile/settings" className="p-2 hover:bg-gray-800/50 rounded-full transition-colors text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-white/10">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-lg font-bold transition-all duration-300 relative ${activeTab === tab ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center min-h-[50vh]">
                    <PaginatedMovieGrid
                        items={activeTab === 'Home' ? watchingmovies : activeTab === 'Watched' ? watchedmovies : watchlistedmovies}
                        emptyMessage={activeTab === 'Home' ? "This channel doesn't have any content yet" : `You don't have any movies in your ${activeTab} yet`}
                        onSuccess={fetchWatchlist}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
