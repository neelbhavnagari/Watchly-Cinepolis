"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import MovieCard from "@/components/MovieCard";
import CoffeeLoader from "@/components/CoffeeLoader";
import { ChevronLeft, ChevronRight, ChevronDown } from "@deemlol/next-icons";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { jersey25 } from "../ui/fonts";

const sortOptions = [
    { label: "Popularity Descending", value: "popularity.desc" },
    { label: "Popularity Ascending", value: "popularity.asc" },
    { label: "Title (Z - A)", value: "title.desc" },
    { label: "Title (A - Z)", value: "title.asc" },
    { label: "Release Date Descending", value: "primary_release_date.desc" },
    { label: "Release Date Ascending", value: "primary_release_date.asc" },
];

const genresList = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
];

function DiscoverContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Read from URL, with fallback
    const pageParam = searchParams.get("page");
    const sortParam = searchParams.get("sortBy");
    const genreParam = searchParams.get("genre") || "";
    const fromParam = searchParams.get("from") || "";
    const toParam = searchParams.get("to") || "";
    const adultParam = searchParams.get("adult") || "false";

    const page = pageParam ? Number(pageParam) : 1;
    const sort = sortParam || "popularity.desc";

    // Accordion states
    const [isSortOpen, setIsSortOpen] = useState(true);
    const [isReleaseDatesOpen, setIsReleaseDatesOpen] = useState(true);
    const [isGenresOpen, setIsGenresOpen] = useState(true);
    const [isAdultOpen, setIsAdultOpen] = useState(true);

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [jumpPage, setJumpPage] = useState(page.toString());

    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setJumpPage(page.toString());
    }, [page]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchMovies = async () => {
        const res = await axios.get(`/api/movies`, {
            params: {
                page,
                sortBy: sort,
                genre: genreParam || undefined,
                from: fromParam || undefined,
                to: toParam || undefined,
                adult: adultParam === "true" ? "true" : undefined
            }
        });
        return res.data;
    };

    const { data, isLoading: loading } = useQuery({
        queryKey: ["discoverMovies", page, sort, genreParam, fromParam, toParam, adultParam],
        queryFn: fetchMovies,
        staleTime: 1000 * 60 * 5, // 5 minutes cache before refetch
        cacheTime: 1000 * 60 * 30, // garbage collect after 30 minutes
    });

    const movies: any[] = data?.results || [];
    const totalPages: number = data?.total_pages || 1;

    const updateUrlParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        if (key !== "page") {
            params.set("page", "1"); // Reset to page 1 on any filter change
        }
        router.push(`${pathname}?${params.toString()}`);
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

    const selectedOption = sortOptions.find(opt => opt.value === sort) || sortOptions[0];
    const selectedGenres = genreParam ? genreParam.split(',') : [];

    return (
        <div className="flex flex-col md:flex-row w-[95%] gap-8 items-start">
            {/* 1/4 part for Filters */}
            <div className="w-full md:w-1/4 flex flex-col gap-4">

                {/* Sort Filter Card */}
                <div className="bg-[#1c1c1c] rounded-xl overflow-visible shadow-lg border border-[#333]">
                    <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className={`w-full px-5 py-4 flex justify-between items-center font-bold text-lg hover:bg-[#252525] transition-colors ${isSortOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                        <span>Sort</span>
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isSortOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {isSortOpen && (
                        <div className="px-5 py-4 border-t border-[#333] bg-[#1a1a1a] rounded-b-xl">
                            <label className="block text-sm text-gray-400 mb-2">Sort Results By</label>
                            <div className="relative" ref={selectRef}>
                                <button
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                    className="w-full bg-[#2a2a2a] text-white text-sm p-3 rounded-lg border border-[#444] hover:border-[#01b4e4] focus:outline-none flex justify-between items-center transition-colors"
                                >
                                    <span>{selectedOption.label}</span>
                                    <ChevronDown size={16} />
                                </button>

                                {isSelectOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl py-1 overflow-hidden">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === option.value
                                                    ? "bg-[#01b4e4] text-white font-medium"
                                                    : "text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
                                                    }`}
                                                onClick={() => {
                                                    updateUrlParams("sortBy", option.value);
                                                    setIsSelectOpen(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Release Dates Card */}
                <div className="bg-[#1c1c1c] rounded-xl overflow-visible shadow-lg border border-[#333]">
                    <button
                        onClick={() => setIsReleaseDatesOpen(!isReleaseDatesOpen)}
                        className={`w-full px-5 py-4 flex justify-between items-center font-bold text-lg hover:bg-[#252525] transition-colors ${isReleaseDatesOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                        <span>Release Dates</span>
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isReleaseDatesOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {isReleaseDatesOpen && (
                        <div className="px-5 py-4 border-t border-[#333] bg-[#1a1a1a] rounded-b-xl flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-400">From</label>
                                <input
                                    type="date"
                                    value={fromParam}
                                    onChange={(e) => updateUrlParams("from", e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white text-sm p-3 rounded-lg border border-[#444] focus:outline-none focus:border-[#01b4e4] color-scheme-dark"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm text-gray-400">To</label>
                                <input
                                    type="date"
                                    value={toParam}
                                    onChange={(e) => updateUrlParams("to", e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white text-sm p-3 rounded-lg border border-[#444] focus:outline-none focus:border-[#01b4e4] color-scheme-dark"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Genres Card */}
                <div className="bg-[#1c1c1c] rounded-xl overflow-visible shadow-lg border border-[#333]">
                    <button
                        onClick={() => setIsGenresOpen(!isGenresOpen)}
                        className={`w-full px-5 py-4 flex justify-between items-center font-bold text-lg hover:bg-[#252525] transition-colors ${isGenresOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                        <span>Genres</span>
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isGenresOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {isGenresOpen && (
                        <div className="px-5 py-4 border-t border-[#333] bg-[#1a1a1a] rounded-b-xl">
                            <div className="flex flex-wrap gap-2">
                                {genresList.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => {
                                            let newGenres = [...selectedGenres];
                                            if (newGenres.includes(String(g.id))) {
                                                newGenres = newGenres.filter(id => id !== String(g.id));
                                            } else {
                                                newGenres.push(String(g.id));
                                            }
                                            updateUrlParams("genre", newGenres.join(','));
                                        }}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedGenres.includes(String(g.id))
                                            ? "bg-[#01b4e4] border-[#01b4e4] text-white"
                                            : "bg-transparent border-[#444] text-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Adult Filter Card */}
                <div className="bg-[#1c1c1c] rounded-xl overflow-visible shadow-lg border border-[#333]">
                    <button
                        onClick={() => setIsAdultOpen(!isAdultOpen)}
                        className={`w-full px-5 py-4 flex justify-between items-center font-bold text-lg hover:bg-[#252525] transition-colors ${isAdultOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
                    >
                        <span>Adult</span>
                        <ChevronDown
                            size={20}
                            className={`transform transition-transform ${isAdultOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    {isAdultOpen && (
                        <div className="px-5 py-4 border-t border-[#333] bg-[#1a1a1a] rounded-b-xl">
                            <div className="relative">
                                <select
                                    value={adultParam}
                                    onChange={(e) => updateUrlParams("adult", e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white text-sm p-3 rounded-lg border border-[#444] focus:outline-none focus:border-[#01b4e4] appearance-none"
                                >
                                    <option value="false">Exclude Adult</option>
                                    <option value="true">Include Adult</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Movies List - 3/4 part */}
            <div className="w-full md:w-3/4 flex flex-col items-center md:items-start">
                {loading ? (
                    <div className="w-full flex justify-center mt-20"><CoffeeLoader /></div>
                ) : (
                    <>
                        <div className="flex gap-4 w-full justify-center md:justify-start items-center flex-wrap">
                            {movies.map((item, index) => (
                                <MovieCard
                                    id={item.id}
                                    key={index}
                                    title={item.original_title}
                                    posterUrl={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    overview={item.overview}
                                    releaseDate={item.release_date}
                                    mediaType="movie"
                                />
                            ))}
                        </div>
                        <div className="flex gap-4 py-12 items-center justify-center w-full mt-8">
                            <button
                                disabled={page === 1}
                                onClick={() => updateUrlParams("page", String(page - 1))}
                                className="p-3 bg-[#1c1c1c] rounded-xl disabled:opacity-40 hover:bg-[#252525] transition-all shadow-lg border border-[#333] group"
                            >
                                <ChevronLeft size={24} className="text-gray-400 group-hover:text-[#01b4e4] transition-colors" strokeWidth={2} />
                            </button>
                            
                            <div className="flex items-center gap-3 bg-[#1c1c1c] px-5 py-2.5 rounded-xl shadow-lg border border-[#333]">
                                <span className="text-gray-400 font-medium">Page</span>
                                <input 
                                    type="text" 
                                    value={jumpPage} 
                                    onChange={(e) => setJumpPage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
                                    onBlur={handleJumpPage}
                                    className="w-12 text-center bg-[#2a2a2a] rounded-lg py-1 text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#01b4e4] transition-all"
                                />
                                <span className="text-gray-400 font-medium">of {totalPages}</span>
                            </div>

                            <button
                                disabled={page === totalPages}
                                onClick={() => updateUrlParams("page", String(page + 1))}
                                className="p-3 bg-[#1c1c1c] rounded-xl disabled:opacity-40 hover:bg-[#252525] transition-all shadow-lg border border-[#333] group"
                            >
                                <ChevronRight size={24} className="text-gray-400 group-hover:text-[#01b4e4] transition-colors" strokeWidth={2} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ClearFiltersButton() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const hasFilters = searchParams.toString() !== "";

    if (!hasFilters) return null;

    return (
        <button
            onClick={() => router.push(pathname)}
            className="px-5 py-2 bg-[#1c1c1c] text-[#01b4e4] hover:bg-[#01b4e4] hover:text-white text-sm font-bold rounded-lg transition-all border border-[#01b4e4] shadow-md"
        >
            Clear Filters
        </button>
    );
}

export default function DiscoverPage() {
    return (
        <div className="flex flex-col items-center pb-10">
            <div className="w-[95%] text-left py-5 flex justify-between items-center">
                <h1 className={`${jersey25.className} text-4xl font-bold`}>Discover Movies</h1>
                <Suspense fallback={null}>
                    <ClearFiltersButton />
                </Suspense>
            </div>
            <Suspense fallback={<div className="mt-20"><CoffeeLoader /></div>}>
                <DiscoverContent />
            </Suspense>
        </div>
    );
}
