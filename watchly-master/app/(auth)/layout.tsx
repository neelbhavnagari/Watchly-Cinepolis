import React from "react";
import GridMotion from "@/components/GridMotion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const items = [
        'https://wallpaperaccess.com/full/37945.jpg',
        'https://wallpaperaccess.com/full/37954.jpg',
        'https://wallpaperaccess.com/full/37945.jpg',
        'https://wallpaperaccess.com/full/645154.jpg',
        'https://wallpaperaccess.com/full/37954.jpg',
        'https://wallpaperaccess.com/full/37945.jpg',
        'https://wallpaperaccess.com/full/37954.jpg',
        'https://wallpaperaccess.com/full/37945.jpg',
        'https://wallpaperaccess.com/full/17350.jpg',
        'https://wallpaperaccess.com/full/1655659.jpg',
        'https://wallpaperaccess.com/full/26029769.jpg',
        'https://wallpaperaccess.com/full/1707399.jpg',
        'https://wallpaperaccess.com/full/38454.jpg',
        'https://wallpaperaccess.com/full/54674.jpg',
        'https://wallpaperaccess.com/full/103882.jpg',
        'https://wallpaperaccess.com/full/5485712.jpg',
        'https://wallpaperaccess.com/full/7420347.jpg',
        'https://wallpaperaccess.com/full/7420351.jpg',
        'https://wallpaperaccess.com/full/7420353.jpg',
        'https://wallpaperaccess.com/full/7420362.jpg',
        'https://wallpaperaccess.com/full/1617816.jpg',
        "Item 21",
        "Item 22",
        "https://wallpaperaccess.com/full/7420368.jpg",
        "https://wallpaperaccess.com/full/3893793.jpg",
        'https://wallpaperaccess.com/full/7420372.jpg',
        'https://wallpaperaccess.com/full/7420381.jpg'
    ];

    return (
        <div className="flex min-h-screen bg-[#1e1e1e]">
            {/* Left Image Section - Shared across Auth Routes */}
            <div className="hidden lg:block w-2/3 p-4">
                <div className="w-full h-full rounded-4xl overflow-hidden relative">
                    <GridMotion items={items} />
                </div>
            </div>

            {/* Right Form Section - Dynamic based on the page */}
            <div className="w-full lg:w-1/3 flex flex-col items-center justify-center lg:p-10 text-white">
                {children}
            </div>
        </div>
    );
}
