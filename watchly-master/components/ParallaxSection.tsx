"use client";

import { motion } from "motion/react";

export default function ParallaxSection({ image, children }: { image: string; children: React.ReactNode }) {
    return (
        <div
            className="relative h-[90vh] bg-fixed bg-center bg-cover flex items-center justify-center"
            style={{ backgroundImage: `url(${image})` }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="p-10 rounded-xl bg-black/80 text-white max-w-3xl text-center"
            >
                {children}
            </motion.div>
        </div>
    );
}
