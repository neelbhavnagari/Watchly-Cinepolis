"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MovieCardProps {
    title: string;
    posterUrl: string;
    overview: string;
    releaseDate: string;
    id: number
    mediaType: string;
    currentStatus?: string;
    onSuccess?: () => void;
}

export default function MovieCard({
    title,
    posterUrl,
    overview,
    releaseDate,
    id,
    mediaType,
    currentStatus,
    onSuccess
}: MovieCardProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const [localActionStatus, setLocalActionStatus] = useState<string | null>(null);

    const { data: fetchedStatus, refetch } = useQuery({
        queryKey: ["itemStatus", id, mediaType, user?.id],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('watchlist')
                .select('status')
                .eq('userid', user.id)
                .eq('movieid', id)
                .eq('mediaType', mediaType)
                .maybeSingle();

            if (error) {
                console.error("Error fetching status", error);
                return null;
            }
            return data ? data.status : null;
        },
        enabled: !!user && currentStatus === undefined,
    });

    const displayStatus = localActionStatus !== null 
        ? (localActionStatus === 'removed' ? null : localActionStatus) 
        : (currentStatus !== undefined ? currentStatus : fetchedStatus);

    useEffect(() => {
        setLocalActionStatus(null);
    }, [currentStatus]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    const handleAction = async (e: React.MouseEvent, action: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(false);

        if (!user) {
            alert("Please login first");
            return;
        }

        if (displayStatus === action) {
            alert(`Item is already in your ${action}`);
            return;
        }

        try {
            // Check if it already exists
            const { data: existing, error: selectError } = await supabase
                .from('watchlist')
                .select('*')
                .match({ movieid: id, mediaType: mediaType, userid: user.id })
                .maybeSingle();

            if (selectError && selectError.code !== 'PGRST116') {
                throw selectError;
            }

            if (existing) {
                const { error } = await supabase
                    .from('watchlist')
                    .update({ status: action })
                    .match({ id: existing.id });
                if (error) throw error;
                alert(`Moved to ${action} successfully`);
            } else {
                const { error } = await supabase
                    .from('watchlist')
                    .insert({ userid: user.id, movieid: id, status: action, mediaType: mediaType });
                if (error) throw error;
                alert(`Added to ${action} successfully`);
            }
            
            setLocalActionStatus(action);
            
            if (currentStatus === undefined) {
                refetch();
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(false);

        if (!user) {
            alert("Please login first");
            return;
        }

        try {
            const { error } = await supabase
                .from('watchlist')
                .delete()
                .match({ movieid: id, mediaType: mediaType, userid: user.id });
            
            if (error) throw error;
            alert("Removed successfully");
            
            setLocalActionStatus('removed');
            
            if (currentStatus === undefined) {
                refetch();
            }
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="relative group w-50 h-[300px] rounded-xl overflow-hidden shadow-lg bg-gray-900 transform transition duration-300 hover:scale-102 hover:shadow-2xl">
            <Link href={`/${mediaType}/${id}`} className="block w-full h-full relative">
                {/* Movie Poster */}
                <div className="relative w-full h-full">
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        className="object-fill object-center transition-opacity duration-300 group-hover:opacity-70"
                        priority
                    />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm text-gray-300 line-clamp-3">{overview}</p>
                    <span className="text-xs text-gray-400 mt-2">Release: {releaseDate}</span>
                </div>
            </Link>

            {/* Action Menu */}
            <div className="absolute top-2 right-2 z-20" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-sm"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
                
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl overflow-hidden py-1 z-20">
                        {displayStatus === 'watched' ? (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownOpen(false); alert('Already in Watched'); }}
                                className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-gray-800 transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                In Watched
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAction(e, 'watched')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Add to Watched
                            </button>
                        )}

                        {displayStatus === 'watchlist' ? (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownOpen(false); alert('Already in Watchlist'); }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800 transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                In Watchlist
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAction(e, 'watchlist')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                Add to Watchlist
                            </button>
                        )}

                        {currentStatus !== undefined && displayStatus && (
                            <button
                                onClick={handleRemove}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Remove
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
