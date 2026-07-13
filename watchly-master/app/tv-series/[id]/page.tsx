"use client"
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { motion } from "motion/react"
export default function SeriesDetail() {
    const params = useParams();
    const router = useRouter();
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const [activeSeason, setActiveSeason] = useState<any>(null);
    const { user } = useAuthStore();
    const id = params.id;
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const seasonsContainerRef = useRef<HTMLDivElement>(null);

    const scrollVideos = (direction: 'left' | 'right') => {
        if (videoContainerRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            videoContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollSeasons = (direction: 'left' | 'right') => {
        if (seasonsContainerRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            seasonsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const getSeriesDetails = async () => {
        const res = await axios.get(`/api/tvseries/${id}`);
        return res.data;
    };

    const { data: series, isLoading: isSeriesLoading } = useQuery({
        queryKey: ["tvSeriesDetail", id],
        queryFn: getSeriesDetails,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        enabled: !!id,
    });

    const getSeasonDetails = async () => {
        const res = await axios.get(`/api/tvseries/${id}/season/${activeSeason.season_number}`);
        return res.data;
    };

    const { data: seasonDetails, isFetching: isSeasonLoading } = useQuery({
        queryKey: ["tvSeason", id, activeSeason?.season_number],
        queryFn: getSeasonDetails,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        enabled: !!id && !!activeSeason,
    });

    const handleSeasonClick = (season: any) => {
        setActiveSeason(season);
    };

    const { data: userSeriesStatus, refetch: refetchStatus } = useQuery({
        queryKey: ["seriesStatus", id, user?.id],
        queryFn: async () => {
            if (!user || !series) return null;
            const { data, error } = await supabase
                .from('watchlist')
                .select('status')
                .eq('userid', user.id)
                .eq('movieid', series.id)
                .eq('mediaType', 'tv-series');

            if (error) {
                console.error("Error fetching status", error);
                return null;
            }
            return data && data.length > 0 ? data[0].status : null;
        },
        enabled: !!user && !!series,
    });

    const handleActionClick = async (action: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (userSeriesStatus === action) {
            alert(`Series is already in your ${action}`);
            return;
        }

        if (userSeriesStatus) {
            const { error } = await supabase
                .from('watchlist')
                .update({ status: action })
                .eq('userid', user.id)
                .eq('movieid', series.id)
                .eq('mediaType', 'tv-series');

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }
            alert(`Series moved to ${action}`);
        } else {
            const { error } = await supabase
                .from('watchlist')
                .insert({ userid: user.id, movieid: series.id, status: action, mediaType: "tv-series" });
                
            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }
            alert(`Series added to ${action}`);
        }
        
        refetchStatus();
    };

    if (isSeriesLoading || !series) {
        return <div className="p-6 text-white min-h-screen bg-[#0a0f14] flex items-center justify-center">Loading...</div>;
    }

    const year = series.first_air_date ? new Date(series.first_air_date).getFullYear() : '';

    // Find Certification (Prefer US)
    const certification = series.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || '';

    // Runtime format
    const runtime = series.episode_run_time?.[0];
    const hours = runtime ? Math.floor(runtime / 60) : 0;
    const minutes = runtime ? runtime % 60 : 0;
    const runtimeStr = runtime ? `${hours > 0 ? `${hours}h ` : ''}${minutes}m` : '';

    const genres = series.genres?.map((g: any) => g.name).join(', ');

    // Find trailer
    const trailer = series.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

    // Find creators
    const creators = series.created_by?.slice(0, 4) || [];

    return (
        <div className="min-h-screen bg-[#0a0f14] text-white">
            {/* Banner Section */}
            <div
                className="relative w-full border-b border-gray-800 min-h-[67vh] flex items-center"
                style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f14] via-[#0a0f14]/80 to-[#0a0f14]/60"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-10 items-center w-full">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-full max-w-[300px] mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl relative border border-gray-800">
                        {series.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
                                alt={series.name}
                                className="w-full h-auto object-cover"
                            />
                        ) : (
                            <div className="w-full h-[450px] bg-gray-900 flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}
                        <div className="bg-[#101b2a] w-full p-4 flex flex-col items-center justify-center border-t border-gray-800">
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                Available to Stream
                            </span>
                            <span className="font-semibold text-sm mt-1">Watch Now</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {series.name} {year && <span className="font-normal text-gray-300">({year})</span>}
                        </h1>

                        <div className="flex flex-wrap items-center text-sm text-gray-300 gap-3 mb-6">
                            {certification && (
                                <span className="border border-gray-500 text-gray-300 px-1 py-0.5 rounded text-xs">
                                    {certification}
                                </span>
                            )}
                            {series.first_air_date && <span>{series.first_air_date}</span>}
                            {series.first_air_date && genres && <span className="hidden sm:inline">•</span>}
                            {genres && <span>{genres}</span>}
                            {genres && runtimeStr && <span className="hidden sm:inline">•</span>}
                            {runtimeStr && <span>{runtimeStr}</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => handleActionClick('watchlist')}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg group relative ${userSeriesStatus === 'watchlist'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-[#1e2a3b] hover:bg-[#2a3c54] text-gray-300'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${userSeriesStatus === 'watchlist' ? 'text-white' : 'group-hover:text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                                    {userSeriesStatus === 'watchlist' ? (
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    ) : (
                                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                    )}
                                </svg>
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-gray-700 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                                    {userSeriesStatus === 'watchlist' ? 'In Watchlist' : 'Add to Watchlist'}
                                </span>
                            </button>

                            <button
                                onClick={() => handleActionClick('watched')}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg group relative ${userSeriesStatus === 'watched'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[#1e2a3b] hover:bg-[#2a3c54] text-gray-300'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${userSeriesStatus === 'watched' ? 'text-white' : 'group-hover:text-white'}`} fill="currentColor" viewBox="0 0 24 24">
                                    {userSeriesStatus === 'watched' ? (
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    ) : (
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    )}
                                </svg>
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-gray-700 text-white text-xs py-1.5 px-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                                    {userSeriesStatus === 'watched' ? 'Watched' : 'Mark as Watched'}
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
                        {series.tagline && (
                            <div className="italic text-gray-400 mb-4 text-lg font-light">
                                {series.tagline}
                            </div>
                        )}

                        {/* Overview */}
                        {series.overview && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-2">Overview</h3>
                                <p className="text-gray-300 leading-relaxed max-w-4xl text-sm md:text-base">
                                    {series.overview}
                                </p>
                            </div>
                        )}

                        {/* Creators */}
                        {creators.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4">
                                {creators.map((creator: any) => (
                                    <div key={creator.id} className="flex flex-col">
                                        <span className="font-bold text-sm">{creator.name}</span>
                                        <span className="text-sm text-gray-400">Creator</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Videos Section */}
            {series.videos?.results?.length > 0 && (
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
                            className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide scroll-smooth"
                        >
                            {series.videos.results.filter((v: any) => v.site === 'YouTube').map((video: any) => (
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

            {/* Seasons Section */}
            {series.seasons && series.seasons.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-800">
                    <h2 className="text-2xl font-bold mb-6">Seasons</h2>
                    <div className="relative group">
                        <button
                            onClick={() => scrollSeasons('left')}
                            className="absolute left-0 top-[144px] -translate-y-1/2 -ml-4 md:-ml-6 z-10 bg-[#1e2a3b]/90 hover:bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-gray-700 hidden md:flex items-center justify-center focus:outline-none"
                            aria-label="Scroll left"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div
                            ref={seasonsContainerRef}
                            className="flex overflow-x-auto gap-6 pb-4 snap-x scrollbar-hide scroll-smooth"
                        >
                            {series.seasons.map((season: any) => (
                                <div
                                    key={season.id}
                                    className="flex-shrink-0 w-48 snap-start cursor-pointer group"
                                    onClick={() => handleSeasonClick(season)}
                                >
                                    <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900 aspect-[2/3] mb-3 group/season shadow-lg">
                                        {season.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${season.poster_path}`}
                                                alt={season.name}
                                                className="w-full h-full object-cover group-hover/season:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800">
                                                No Poster
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-white text-base truncate" title={season.name}>{season.name}</h3>
                                    <div className="text-sm text-gray-400 mt-1">
                                        {season.air_date ? new Date(season.air_date).getFullYear() : 'TBA'} • {season.episode_count} Episodes
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollSeasons('right')}
                            className="absolute right-0 top-[144px] -translate-y-1/2 -mr-4 md:-mr-6 z-10 bg-[#1e2a3b]/90 hover:bg-blue-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-gray-700 hidden md:flex items-center justify-center focus:outline-none"
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
            {/* Season Dialog */}
            {activeSeason && (
                <motion.div initial={{ scale: 0, y: "20px" }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: "20px" }} transition={{ duration: 0.5 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="relative w-[90vw] h-[66vh] bg-[#0a0f14] rounded-lg overflow-hidden shadow-2xl border border-gray-800 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#101b2a]">
                            <div>
                                <h3 className="text-2xl font-bold text-white pr-4">{activeSeason.name}</h3>
                                {activeSeason.air_date && (
                                    <p className="text-sm text-gray-400 mt-1">{new Date(activeSeason.air_date).getFullYear()} • {activeSeason.episode_count} Episodes</p>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveSeason(null)}
                                className="text-gray-400 hover:text-white transition-colors flex-shrink-0 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {isSeasonLoading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : seasonDetails?.episodes ? (
                                <div className="flex flex-col gap-4">
                                    {seasonDetails.episodes.map((episode: any) => (
                                        <div key={episode.id} className="flex flex-col md:flex-row gap-6 bg-[#101b2a] rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-colors group/ep">
                                            {/* Episode Image */}
                                            <div className="flex-shrink-0 w-full md:w-64 relative rounded-lg overflow-hidden aspect-video bg-gray-900 border border-gray-800">
                                                {episode.still_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                                                        alt={episode.name}
                                                        className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        No Image
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white border border-gray-700">
                                                    {episode.runtime ? `${episode.runtime}m` : ''}
                                                </div>
                                            </div>

                                            {/* Episode Details */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <h4 className="text-lg font-bold text-white group-hover/ep:text-blue-400 transition-colors">
                                                        <span className="text-gray-500 mr-2">{episode.episode_number}.</span>
                                                        {episode.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium flex-shrink-0">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        {(episode.vote_average || 0).toFixed(1)}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-400 mb-3 font-medium">
                                                    {episode.air_date ? new Date(episode.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA'}
                                                </div>
                                                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                                                    {episode.overview || "No overview available."}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center py-10">No episodes found.</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
