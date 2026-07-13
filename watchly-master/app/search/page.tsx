'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi } from '@/services/tmdb-api';
import { ChevronLeft, ChevronRight } from '@deemlol/next-icons';
import { useRouter } from "next/navigation";
import MovieCard from '@/components/MovieCard';
import axios from 'axios';
import CoffeeLoader from '@/components/CoffeeLoader';
import { motion } from 'motion/react';

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const type = (searchParams.get('type') as 'movie' | 'tv' | 'multi') || 'multi';
    const [movies, setMovies] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const pageParam = searchParams.get("page");
    const page = pageParam ? Number(pageParam) : 1;
    const [loading, setloading] = useState(false);
    const [jumpPage, setJumpPage] = useState(page.toString());

    useEffect(() => {
        setJumpPage(page.toString());
    }, [page]);

    const searchMovies = async (query: string, type: 'movie' | 'tv' | 'multi', page: number = 1) => {
        if (!query) return;
        setloading(true);
        const res = await axios.get(`/api/search?query=${query}&type=${type}&page=${page}`);
        setMovies(res.data.results);
        setTotalPages(res.data.total_pages);
        setloading(false);
    }

    useEffect(() => {
        searchMovies(query, type, page);
    }, [query, type, page]);

    const updateUrlParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    };

    const handleJumpPage = () => {
        let p = parseInt(jumpPage);
        if (isNaN(p) || p < 1) p = 1;
        if (p > totalPages) p = totalPages;
        if (p !== page) {
            updateUrlParams("page", String(p));
        } else {
            setJumpPage(page.toString());
        }
    };

    return (
        <div className="flex flex-col gap-6 items-center pt-8 pb-16 min-h-screen bg-[#0a0a0a]">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-8 w-full"
            >
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 drop-shadow-md text-center px-4">
                    Search Results
                </h1>
                <p className="text-gray-400 text-lg">
                    Showing results for <span className="text-white font-bold italic">"{query}"</span>
                </p>
            </motion.div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                    <CoffeeLoader />
                </div>
            ) : (
                <div className="w-[95%] max-w-7xl flex flex-col items-center">
                    {movies.length === 0 ? (
                        <div className="text-center mt-20">
                            <h2 className="text-2xl font-bold text-gray-500">No results found.</h2>
                            <p className="text-gray-600 mt-2">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-6 w-full justify-center flex-wrap"
                        >
                            {movies.map((item, index) => (
                                <MovieCard
                                    id={item.id}
                                    key={index}
                                    title={item.original_name || item.title || item.name}
                                    posterUrl={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    overview={item.overview}
                                    releaseDate={item.release_date || item.first_air_date}
                                    mediaType={item.release_date || item.title ? "movie" : "tv-series"}
                                />
                            ))}
                        </motion.div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex gap-4 py-12 items-center justify-center w-full mt-8">
                            <button
                                disabled={page === 1}
                                onClick={() => updateUrlParams("page", String(page - 1))}
                                className="p-3 bg-[#1a1f2c] rounded-xl disabled:opacity-40 hover:bg-[#252b3b] transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group"
                            >
                                <ChevronLeft size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                            </button>
                            
                            <div className="flex items-center gap-3 bg-[#1a1f2c] px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/5">
                                <span className="text-gray-400 font-medium">Page</span>
                                <input 
                                    type="text" 
                                    value={jumpPage} 
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                                    onBlur={handleJumpPage}
                                    className="w-12 text-center bg-white/5 rounded-lg py-1 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <span className="text-gray-400 font-medium">of {totalPages}</span>
                            </div>

                            <button
                                disabled={page === totalPages}
                                onClick={() => updateUrlParams("page", String(page + 1))}
                                className="p-3 bg-[#1a1f2c] rounded-xl disabled:opacity-40 hover:bg-[#252b3b] transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] group"
                            >
                                <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors" strokeWidth={2} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <CoffeeLoader />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
