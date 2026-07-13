// 'use client';

// import { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';
// import { searchApi } from '@/services/tmdb-api';
// import { cause } from '@/app/ui/fonts';
// export default function Searchbar() {
//     const [query, setQuery] = useState('');
//     const [results, setResults] = useState<any[]>([]);
//     const pathname = usePathname();

//     useEffect(() => {
//         if (!query) {
//             setResults([]);
//             return;
//         }
//         // console.log(pathname)
//         const handler = setTimeout(() => {
//             let type: 'movie' | 'tv' | 'multi' = 'multi';
//             if (pathname.includes('/discover')) type = 'movie';
//             else if (pathname.includes('/tv-series')) type = 'tv';

//             searchApi(query, type)
//                 .then(data => { setResults(data.results) })
//                 .catch(err => console.error(err));
//         }, 500); // 500ms debounce

//         return () => clearTimeout(handler); // cleanup
//     }, [query, pathname]);
//     return (
//         <div className='flex items-center justify-center w-1/2'>
//             <input
//                 type="text"
//                 placeholder="Search..."
//                 value={query}
//                 className={`${cause.className} w-full px-4 py-2 rounded-md border border-gray-300 font-bold`}
//                 onChange={e => setQuery(e.target.value)}
//             />
//             <ul className='absolute top-[70px] z-50'>
//                 {results.map((item: any) => (
//                     <li key={item.id}>{item.title || item.name}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = () => {
        if (!query) return;

        let type: 'movie' | 'tv' | 'multi' = 'multi';
        if (pathname.includes('/discover')) type = 'movie';
        else if (pathname.includes('/tv-series')) type = 'tv';

        router.push(`/search?query=${encodeURIComponent(query)}&type=${type}`);
    };

    return (
        <div className="relative w-full max-w-md group">
            <div
                className="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer"
                onClick={handleSearch}
            >
                <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Search movies, tv shows..."
                value={query}
                className="w-full pl-12 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300"
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </div>
    );
}
