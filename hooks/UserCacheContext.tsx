import React, { createContext, useContext, useRef, useCallback } from "react";

export interface UserCacheUser {
    id: string;
    studios: any[];
    username: string;
    verified: boolean;
    isStudio?: boolean;
    admin?: boolean;
    disabled?: boolean;
    inventory?: any[];
    ownedItems?: any[];
    badges: ('staff' | 'moderator' | 'community_manager' | 'early_user' | 'bug_hunter' | 'contributor' | 'partner')[];
}

interface UserCacheContextType {
    getUser: (userId: string, cache?: boolean, admin?: boolean) => Promise<UserCacheUser | null>;
    cacheUser: (user: UserCacheUser) => void;
    cache: Record<string, UserCacheUser>;
}

const UserCacheContext = createContext<UserCacheContextType | undefined>(undefined);

export const UserCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const userCacheRef = useRef<Record<string, UserCacheUser>>({});

    const cacheUser = useCallback((user: UserCacheUser) => {
        console.log("Caching user:", user);
        if (user && user.id) {
            userCacheRef.current[user.id] = user;
        }
    }, []);

    const getUser = useCallback(async (userId: string, cache = true, admin = false): Promise<UserCacheUser | null> => {
        if (!userId) return null;
        if (userCacheRef.current[userId] && cache) {
            console.log("Returning cached user:", userId);
            return userCacheRef.current[userId];
        }
        try {
            console.log("Fetching user from API:", userId, "Admin:", admin);
            const res = await fetch(`/api/users/${admin ? "admin/" : ""}${userId}`);
            if (!res.ok) throw new Error("Failed to fetch user");
            const user: UserCacheUser = await res.json();
            cacheUser(user);
            return user;
        } catch {
            return null;
        }
    }, [cacheUser]);

    return (
        <UserCacheContext.Provider value={{ getUser, cacheUser, cache: userCacheRef.current }}>
            {children}
        </UserCacheContext.Provider>
    );
};

export function useUserCacheContext() {
    const ctx = useContext(UserCacheContext);
    if (!ctx) throw new Error("useUserCacheContext must be used within a UserCacheProvider");
    return ctx;
}
