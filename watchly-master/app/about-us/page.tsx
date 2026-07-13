import ParallaxSection from "@/components/ParallaxSection";
import { cause, geistMono, jersey25 } from "../ui/fonts";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="text-white">

            <ParallaxSection image="https://wallpaperaccess.com/full/1460186.jpg">
                <h1 className={`text-6xl font-bold mb-4 ${jersey25.className}`}>Your Movie Journey, Simplified</h1>
                <p className={`text-xl ${cause.className}`}>Movies aren’t just entertainment — they’re memories, moods, and moments.</p>
            </ParallaxSection>

            <ParallaxSection image="https://wallpaperaccess.com/full/1637459.jpg">
                <h2 className={`text-5xl font-semibold mb-4 ${jersey25.className}`}>Why We Exist</h2>
                <p className={`text-xl ${cause.className}`}>We make movie nights effortless by helping you track, save, and rediscover films.</p>
            </ParallaxSection>

            <ParallaxSection image="https://wallpaperaccess.com/full/1085600.jpg">
                <h2 className={`text-5xl font-semibold mb-4 ${jersey25.className}`}>What You Can Do</h2>
                <ul className={`text-xl ${cause.className} space-y-2`}>
                    <li>🎯 Save movies & shows to your watchlist</li>
                    <li>📖 Track your viewing history</li>
                    <li>📺 Explore TV seasons & episodes</li>
                </ul>
            </ParallaxSection>

            <ParallaxSection image="https://wallpaperaccess.com/full/3658600.jpg">
                <h2 className={`text-5xl font-semibold mb-4 ${jersey25.className}`}>More Than a Website</h2>
                <p className={`text-xl ${cause.className}`}>This is your companion in the world of cinema — where moods meet movies.</p>
            </ParallaxSection>

            <ParallaxSection image="https://wallpaperaccess.com/full/1303273.jpg">
                <h2 className={`text-5xl font-bold mb-4 ${jersey25.className}`}>Start Your Movie Journey Today</h2>
                <Link href="/signup">
                    <button className={`px-6 py-3 bg-red-600 rounded-lg text-lg font-semibold hover:bg-red-700 transition ${cause.className}`}>
                        Create Your Watchlist
                    </button>
                </Link>
            </ParallaxSection>
        </div>
    );
}
