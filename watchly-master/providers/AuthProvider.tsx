"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());
    const setUser = useAuthStore((state) => state.setUser);
    const setProfile = useAuthStore((state) => state.setProfile);

    useEffect(() => {
        const fetchProfile = async (userId: string | undefined) => {
            if (!userId) {
                setProfile(null);
                return;
            }
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (data && !error) {
                setProfile(data);
            }
        };

        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setUser(session?.user ?? null);
            fetchProfile(session?.user?.id);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            fetchProfile(session?.user?.id);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return <><QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider></>;
}