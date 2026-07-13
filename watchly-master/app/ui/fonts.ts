import { Geist, Geist_Mono, Jersey_25, Cause } from "next/font/google";
export const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const jersey25 = Jersey_25({
    subsets: ["latin"],
    weight: "400",
});

export const cause = Cause({
    subsets: ["latin"],
});