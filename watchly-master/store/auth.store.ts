import { create } from "zustand";
import { User } from "@supabase/supabase-js";

export type Profile = {
    id: string;
    username: string;
    avatar: string;
    updated_at?: string;
};

type AuthStore = {
    user: User | null;
    profile: Profile | null;
    setUser: (user: User | null) => void;
    setProfile: (profile: Profile | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    profile: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
}));