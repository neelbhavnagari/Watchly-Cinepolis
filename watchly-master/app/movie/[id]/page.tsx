"use client"
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function MovieDetail() {
    const params = useParams();
    const router = useRouter();
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const { user } = useAuthStore();
    const id = params.id;
    const videoContainerRef = useRef<HTMLDivElement>(null);

    const scrollVideos = (direction: 'left' | 'right') => {
        if (videoContainerRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            videoContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const getMoviesDetails = async () => {
        const res = await axios.get(`/api/movies/${id}`);
        return res.data;
    };

    const { data: movie, isLoading } = useQuery({
        queryKey: ["movie", id],
        queryFn: getMoviesDetails,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        enabled: !!id,
    });

    const { data: userMovieStatus, refetch: refetchStatus } = useQuery({
        queryKey: ["movieStatus", id, user?.id],
        queryFn: async () => {
            if (!user || !movie) return null;
            const { data, error } = await supabase
                .from('watchlist')
                .select('status')
                .eq('userid', user.id)
                .eq('movieid', movie.id)
                .eq('mediaType', 'movie');

            if (error) {
                console.error("Error fetching status", error);
                return null;
            }
            return data && data.length > 0 ? data[0].status : null;
        },
        enabled: !!user && !!movie,
    });

    const handleActionClick = async (action: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (userMovieStatus === action) {
            alert(`Movie is already in your ${action}`);
            return;
        }

        if (userMovieStatus) {
            const { error } = await supabase
                .from('watchlist')
                .update({ status: action })
                .eq('userid', user.id)
                .eq('movieid', movie.id)
                .eq('mediaType', 'movie');

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }
            alert(`Movie moved to ${action}`);
        } else {
            const { error } = await supabase
                .from('watchlist')
                .insert({ userid: user.id, movieid: movie.id, status: action, mediaType: "movie" });

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }
            alert(`Movie added to ${action}`);
        }

        refetchStatus();
    };

    if (isLoading || !movie) {
        return <div className="p-6 text-white min-h-screen bg-[#0a0f14] flex items-center justify-center">Loading...</div>;
    }

    const year = new Date(movie.release_date).getFullYear();

    // Find Certification (Prefer US, fallback to first available or none)
    const usRelease = movie.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
    const certification = usRelease?.release_dates?.[0]?.certification || '';

    // Runtime format
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    const runtimeStr = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

    const genres = movie.genres?.map((g: any) => g.name).join(', ');

    // Find trailer
    const trailer = movie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

    // Find crew
    const directors = movie.credits?.crew?.filter((c: any) => c.job === 'Director').slice(0, 2) || [];
    const writers = movie.credits?.crew?.filter((c: any) => ['Screenplay', 'Writer', 'Novel', 'Author', 'Story'].includes(c.job)).slice(0, 3) || [];
    const importantCrew = [...directors, ...writers].filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.job === v.job)) === i).slice(0, 4); // remove duplicates and limit to 4

    return (
        <div className="min-h-screen bg-[#0a0f14] text-white">
            {/* Banner Section */}
            <div
                className="relative w-full border-b border-gray-800 min-h-[67vh] flex items-center"
                style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f14] via-[#0a0f14]/80 to-[#0a0f14]/60"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-10 items-center w-full">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-full max-w-[300px] mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-auto object-cover"
                        />
                        <div className="bg-[#101b2a] w-full p-4 flex flex-col items-center justify-center border-t border-gray-800">
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                Available to Rent or Buy
                            </span>
                            <span className="font-semibold text-sm mt-1">Watch Now</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {movie.title} <span className="font-normal text-gray-300">({year})</span>
                        </h1>

                        <div className="flex flex-wrap items-center text-sm text-gray-300 gap-3 mb-6">
                            {certification && (
                                <span className="border border-gray-500 text-gray-300 px-1 py-0.5 rounded text-xs">
                                    {certification}
                                </span>
                            )}
                            <span>{movie.release_date}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{genres}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{runtimeStr}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => handleActionClick('watchlist')}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg group relative ${userMovieStatus === 'watchlist'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-[#1e2a3b] hover:bg-[#2a3c54] text-gray-300'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${userMovieStatus === 'watchlist' ? 'text-white' : 'group-hover:text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                                    {userMovieStatus === 'watchlist' ? (
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    ) : (
                                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                    )}
                                </svg>
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-gray-700 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                                    {userMovieStatus === 'watchlist' ? 'In Watchlist' : 'Add to Watchlist'}
                                </span>
                            </button>

                            <button
                                onClick={() => handleActionClick('watched')}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg group relative ${userMovieStatus === 'watched'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[#1e2a3b] hover:bg-[#2a3c54] text-gray-300'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${userMovieStatus === 'watched' ? 'text-white' : 'group-hover:text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                                    {userMovieStatus === 'watched' ? (
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    ) : (
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    )}
                                </svg>
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-gray-700 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                                    {userMovieStatus === 'watched' ? 'Watched' : 'Mark as Watched'}
                                </span>
                            </button>

                            {trailer && (
                                <button
                                    onClick={() => setActiveVideo(trailer)}
                                    className="flex items-center gap-2 hover:text-gray-300 transition-colors ml-2 font-medium"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Play Trailer
                                </button>
                            )}
                        </div>

                        {/* Tagline */}
                        {movie.tagline && (
                            <div className="italic text-gray-400 mb-4 text-lg font-light">
                                {movie.tagline}
                            </div>
                        )}

                        {/* Overview */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2">Overview</h3>
                            <p className="text-gray-300 leading-relaxed max-w-4xl text-sm md:text-base">
                                {movie.overview}
                            </p>
                        </div>

                        {/* Crew */}
                        {importantCrew.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4">
                                {importantCrew.map((member: any) => (
                                    <div key={`${member.id}-${member.job}`} className="flex flex-col">
                                        <span className="font-bold text-sm">{member.name}</span>
                                        <span className="text-sm text-gray-400">{member.job}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Videos Section */}
            {movie.videos?.results?.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-800">
                    <h2 className="text-2xl font-bold mb-6">Videos</h2>
                    <div className="relative group">
                        <button
                            onClick={() => scrollVideos('left')}
                            className="absolute left-0 top-[81px] md:top-[90px] -translate-y-1/2 -ml-4 md:-ml-6 z-10 bg-[#1e2a3b]/90 hover:bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-gray-700 hidden md:flex items-center justify-center focus:outline-none"
                            aria-label="Scroll left"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div
                            ref={videoContainerRef}
                            className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide"
                        >
                            {movie.videos.results.filter((v: any) => v.site === 'YouTube').map((video: any) => (
                                <div
                                    key={video.id}
                                    className="flex-shrink-0 w-72 md:w-80 cursor-pointer group/video snap-start"
                                    onClick={() => setActiveVideo(video)}
                                >
                                    <div className="relative rounded-lg overflow-hidden border border-gray-800 aspect-video bg-gray-900">
                                        <img
                                            src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                                            alt={video.name}
                                            className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors flex items-center justify-center">
                                            <svg className="w-12 h-12 text-white opacity-80 group-hover/video:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="mt-3 text-sm text-gray-200 font-medium line-clamp-2 group-hover/video:text-white transition-colors" title={video.name}>{video.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{video.type}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollVideos('right')}
                            className="absolute right-0 top-[81px] md:top-[90px] -translate-y-1/2 -mr-4 md:-mr-6 z-10 bg-[#1e2a3b]/90 hover:bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-gray-700 hidden md:flex items-center justify-center focus:outline-none"
                            aria-label="Scroll right"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Video Dialog */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                        <div className="flex justify-between items-center p-4 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-white truncate pr-4">{activeVideo.name}</h3>
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="relative pt-[56.25%] w-full bg-black">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1`}
                                title={activeVideo.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
