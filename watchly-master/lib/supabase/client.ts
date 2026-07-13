import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Provide a helpful runtime proxy so the app doesn't crash at import time.
    // Any access will throw with an actionable message.
    const message =
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase = new Proxy({}, {
        get() {
            throw new Error(message);
        },
        apply() {
            throw new Error(message);
        }
    }) as any;
    // Also log once to the server console to aid development.
    // eslint-disable-next-line no-console
    console.warn("[supabase] ", message);
}

export { supabase };
// import { createBrowserClient } from "@supabase/ssr";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// export const createClient = () =>
//     createBrowserClient(
//         supabaseUrl!,
//         supabaseKey!,
//     );