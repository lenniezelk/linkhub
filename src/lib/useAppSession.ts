import { useSession } from "@tanstack/react-start/server";
import type { AppSession } from "./types";

export function useAppSession() {
    return useSession<AppSession>({
        password: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
    });
}