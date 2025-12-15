import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User3DScanProjectDto } from "../generated-client";
import { http } from "../lib/api";

export function useInitializeUser3DScans({ userId }: { userId?: string }) {

    const [scans, setScans] = useState<User3DScanProjectDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        http.user3DScans.getClientScans(userId)
            .then((response) => {
                setScans(response || []);

                if (!response?.length)
                    toast.info("No scans found!");
            }).catch((e) => {
                const message = e.response?.data?.message || "An unexpected error occurred.";
                toast.error(`Error: ${message}`);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    return { scans, loading };
}