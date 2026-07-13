"use client";

import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import Link from "next/link";
import CoffeeLoader from "@/components/CoffeeLoader";
import { jersey25 } from "./ui/fonts";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/auth.store";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

// Fetch both movies and tv series for the hero banner
const fetchHeroMedia = async () => {
  const [moviesRes, tvRes] = await Promise.all([
    axios.get(`/api/movies/now_playing`),
    axios.get(`/api/tvseries`)
  ]);

  const movies = moviesRes.data.results.map((m: any) => ({ ...m, media_type: 'movie' })).slice(0, 7);
  const tvs = tvRes.data.results.map((t: any) => ({ ...t, media_type: 'tv' })).slice(0, 7);
  // console.log(movies, tvs)
  // Interleave them
  const combined = [];
  for (let i = 0; i < Math.max(movies.length, tvs.length); i++) {
    if (movies[i]) combined.push(movies[i]);
    if (tvs[i]) combined.push(tvs[i]);
  }
  return combined;
};

const moods = [
  { name: "Comedy", emoji: "😂", gradient: "from-yellow-400 to-orange-500", url: "/discover?genre=35" },
  { name: "Thriller", emoji: "😱", gradient: "from-slate-700 to-black", url: "/discover?genre=53" },
  { name: "Action", emoji: "💥", gradient: "from-red-500 to-red-800", url: "/discover?genre=28" },
  { name: "Romance", emoji: "❤️", gradient: "from-pink-400 to-rose-600", url: "/discover?genre=10749" },
  { name: "Sci-Fi", emoji: "👽", gradient: "from-blue-500 to-indigo-700", url: "/discover?genre=878" },
];

export default function Home() {
  const { user } = useAuthStore();
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const fetchWatchlist = async () => {
        const { data } = await supabase.from('watchlist').select('*');
        if (data) setWatchlist(data);
      };
      fetchWatchlist();
    }
  }, [user]);

  const watchedCount = watchlist.filter((item) => item.status === "watched").length;

  let badge = "Guest Viewer";
  let badgeEmoji = "👋";
  if (user) {
    if (watchedCount === 0) { badge = "Newbie"; badgeEmoji = "🍿"; }
    else if (watchedCount <= 5) { badge = "Casual Viewer"; badgeEmoji = "📺"; }
    else if (watchedCount <= 15) { badge = "Movie Buff"; badgeEmoji = "🎬"; }
    else { badge = "Weekend Binger"; badgeEmoji = "🎖️"; }
  } else {
    badge = "Weekend Binger";
    badgeEmoji = "🎖️";
  }

  const { data: heroMedia, isLoading } = useQuery({
    queryKey: ["heroMedia"],
    queryFn: fetchHeroMedia,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] overflow-hidden">
      {/* Hero Banner Auto Slider */}
      {isLoading ? (
        <div className="h-[75vh] w-full flex items-center justify-center">
          <CoffeeLoader />
        </div>
      ) : (
        heroMedia && (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="w-full h-[65vh] sm:h-[75vh] md:h-[85vh] mb-10"
          >
            {heroMedia.slice(0, 10).map((media: any) => (
              <SwiperSlide key={media.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="relative h-full w-full flex items-center justify-center bg-cover bg-top"
                  style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdrop_path})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/40 to-transparent"></div>

                  <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-[95%] sm:w-[90%] max-w-full mx-auto mt-14 sm:mt-20">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      className="max-w-full"
                    >
                      <div className="inline-block px-3 py-1.5 mb-4 rounded-full bg-red-600/90 backdrop-blur-md text-xs sm:text-sm font-bold tracking-widest text-white uppercase border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        {media.media_type === 'tv' ? 'Trending Series' : 'Now Playing'}
                      </div>
                                  <h1 className="text-2xl sm:text-4xl md:text-7xl font-extrabold mb-4 sm:mb-5 text-white drop-shadow-2xl leading-tight">
                        {media.title || media.name || media.original_title || media.original_name}
                      </h1>
                      <p className="mt-2 text-xs sm:text-sm md:text-xl text-gray-200 line-clamp-3 mb-6 sm:mb-8 drop-shadow-md font-medium leading-relaxed max-w-full">
                        {media.overview}
                      </p>

                      <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                        <Link href={`/${media.media_type === 'tv' ? 'tv-series' : 'movie'}/${media.id}`}>
                          <button className="w-full sm:w-auto px-6 py-4 bg-white text-black rounded-full hover:bg-gray-200 transition font-bold text-base md:text-lg flex items-center justify-center gap-2 group shadow-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            More Info
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )
      )}

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-[95%] max-w-4xl mx-auto my-12 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-blue-900/50 p-5 sm:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden group"
      >
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px] group-hover:bg-blue-500/40 transition-colors duration-700"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px] group-hover:bg-purple-500/40 transition-colors duration-700"></div>

        <div className="text-center md:text-left mb-10 md:mb-0 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">What are you looking for?</h2>
          <p className="text-blue-100/80 text-lg md:text-xl max-w-xl font-medium">Explore millions of movies and TV shows instantly. Find your next favorite story today.</p>
        </div>

        <Link href="/search" className="relative z-10 w-full md:w-auto">
          <button className="w-full md:w-auto relative px-6 sm:px-10 py-4 bg-blue-600 rounded-full font-bold text-base sm:text-xl text-white overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-all duration-300 hover:-translate-y-1">
            <span className="relative z-10 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Search Now
            </span>
            <div className="absolute inset-0 h-full w-0 bg-white/20 hover:w-full transition-all duration-500 ease-out"></div>
          </button>
        </Link>
      </motion.div>

      {/* Mood Selector - Cool Version */}
      <div className="w-[95%] max-w-4xl mx-auto my-16">
        <div className="text-center mb-10">
          <h2 className={`${jersey25.className} text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg`}>Choose Your Mood 🎭</h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl font-medium">Pick a vibe and let us do the rest.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {moods.map((m, idx) => (
            <Link href={m.url} key={idx}>
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                className={`relative h-56 rounded-[2rem] cursor-pointer overflow-hidden shadow-2xl border border-white/10 group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
                  <span className="text-6xl mb-6 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500 drop-shadow-2xl">{m.emoji}</span>
                  <h3 className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md">{m.name}</h3>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-[90%] max-w-7xl mx-auto my-16 bg-[#121820] p-12 rounded-[3rem] border border-white/5 shadow-2xl text-white text-center flex flex-col md:flex-row items-center justify-around gap-10"
      >
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-extrabold mb-3 text-white">Your Movie Stats</h2>
          <p className="text-gray-400 text-lg font-medium">Keep up the good work!</p>
        </div>
        <div className="flex flex-wrap justify-center gap-16">
          <div className="flex flex-col items-center">
            <span className="text-6xl font-black text-blue-500 mb-3 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {user ? watchedCount : 12}
            </span>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Movies Watched</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-6xl font-black text-green-500 mb-3 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              {user ? "Diverse" : "Sci-Fi"}
            </span>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Top Genre</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-6xl font-black text-yellow-500 mb-3 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">{badgeEmoji}</span>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{badge}</span>
          </div>
        </div>
      </motion.div>

      {/* CTA Spotlight */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full bg-gradient-to-t from-black via-[#0d1117] to-transparent pt-24 pb-32 mt-10 flex flex-col items-center justify-center text-center px-4"
      >
        <h2 className="text-5xl md:text-6xl font-black mb-8 text-white drop-shadow-2xl">Ready for Your Next Movie Night?</h2>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl font-medium">Dive back into your curated list of favorites and undiscovered gems.</p>
        <Link href="/profile">
          <button className="px-10 py-5 bg-red-600 rounded-full text-xl font-bold text-white hover:bg-red-700 transition-colors shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:shadow-[0_0_50px_rgba(220,38,38,0.8)] flex items-center gap-4 hover:scale-105 transform duration-300">
            Explore Your Watchlist
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
