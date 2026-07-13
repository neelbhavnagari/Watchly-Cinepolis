"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setloading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setloading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { return alert(error.message), setloading(false) };
        alert("Login successful!");
        router.push("/")
        setloading(false)
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) return alert(error.message);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md bg-[#090c10]/60 p-10 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
            {/* Glow effect behind the form */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/20 blur-[80px] pointer-events-none"></div>

            <div className="text-center mb-10 relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-white font-black text-3xl drop-shadow-md">W</span>
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold mb-2 text-white tracking-tight">Welcome Back</h2>
                <p className="text-gray-400 font-medium">Please enter your details to sign in.</p>
            </div>

            <div className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300 pl-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="hello@example.com"
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/10 transition-all duration-300 shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-300 pl-1">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/10 transition-all duration-300 shadow-inner"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="flex justify-end mt-2">
                    <a href="#" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                </div>

                <button
                    disabled={loading}
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 mt-4 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] flex justify-center items-center group"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                            Log In
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </span>
                    )}
                </button>
            </div>

            {/* <div className="flex items-center my-8 relative z-10">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-4 text-gray-400 text-xs font-bold tracking-widest uppercase">Or</span>
                <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="space-y-4 relative z-10">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue With Google
                </button>
            </div> */}

            <p className="text-center text-gray-400 mt-8 text-sm font-medium relative z-10">
                Don't have an account? <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold hover:underline transition-colors">Sign Up</Link>
            </p>
        </motion.div>
    );
}
