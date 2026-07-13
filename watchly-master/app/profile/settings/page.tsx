"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Settings() {
    const { user, profile, setProfile } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=4ade80');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.email) setEmail(user.email);
        if (profile?.avatar) setAvatarPreview(profile.avatar);
    }, [user, profile]);

    const username = profile?.username || user?.user_metadata?.username || 'user';

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("You must be logged in to update settings.");

        setLoading(true);
        let errorMessages = [];

        // Update Auth Info (Email & Password)
        const updateAuthPayload: any = {};
        if (email !== user.email && email.trim() !== '') updateAuthPayload.email = email;
        if (password.trim() !== '') updateAuthPayload.password = password;

        if (Object.keys(updateAuthPayload).length > 0) {
            const { error: authError } = await supabase.auth.updateUser(updateAuthPayload);
            if (authError) errorMessages.push(`Auth Error: ${authError.message}`);
        }

        // Update Profile (Avatar)
        let newAvatarUrl = profile?.avatar;

        if (avatarFile) {
            // If they have an 'avatars' bucket, upload it. Otherwise, this might fail if bucket doesn't exist.
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) {
                errorMessages.push(`Upload Error: ${uploadError.message}`);
            } else if (uploadData) {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                newAvatarUrl = publicUrl;
            }
        }

        if (newAvatarUrl !== profile?.avatar) {
            const { data: updatedProfile, error: profileError } = await supabase
                .from('profiles')
                .update({ avatar: newAvatarUrl })
                .eq('id', user.id)
                .select()
                .single();

            if (profileError) {
                errorMessages.push(`Profile Error: ${profileError.message}`);
            } else if (updatedProfile) {
                setProfile(updatedProfile);
            }
        }

        setLoading(false);
        if (errorMessages.length > 0) {
            alert(`Some updates failed:\n${errorMessages.join('\n')}`);
        } else {
            alert("Settings updated successfully!");
            setPassword(''); // Clear password field on success
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans py-12 px-6 relative">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-blue-500/10 blur-[120px] pointer-events-none"></div>

                <div className="max-w-2xl mx-auto w-full relative z-10">
                    {/* Back Link */}
                    <Link href="/profile" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Profile
                    </Link>

                    <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Account Settings</h1>

                    <div className="bg-[#090c10]/60 border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full"></div>
                        
                        <form onSubmit={handleSave} className="space-y-8 relative z-10">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 pb-8 border-b border-white/10">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-800 ring-2 ring-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-3 text-white">Profile Picture</h3>
                                    <div className="flex gap-3">
                                        <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                                            Change Avatar
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setAvatarFile(null); setAvatarPreview("https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=4ade80"); }}
                                            className="bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                {/* Username (Read Only) */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-400 pl-1">
                                        Username <span className="text-xs text-gray-500 ml-1 font-medium">(Read Only)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        readOnly
                                        className="w-full bg-white/5 border border-white/5 text-gray-500 rounded-xl px-4 py-3.5 cursor-not-allowed focus:outline-none shadow-inner"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-300 pl-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-300 pl-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner"
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="pt-8 flex justify-end gap-4 border-t border-white/10">
                                <Link href="/profile" className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
