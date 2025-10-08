import jwt from "jsonwebtoken";
import React, { createContext, useContext, useEffect, useState } from "react";
import useUserCache from "./useUserCache";

export function getToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : localStorage.getItem("token") || null;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: string | null;
  apiKey: string | null;
  balance: number | null;
  setBalance: React.Dispatch<React.SetStateAction<number | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getBalanceFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)balance=([^;]*)/);
  return match ? parseFloat(match[1]) : null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(getBalanceFromCookie());
  const { cacheUser } = useUserCache();

  useEffect(() => {
    const token = getToken();
    try {
      const decodedToken = jwt.decode(token);
      if (decodedToken && typeof decodedToken === "object" && decodedToken.user_id) {
        setApiKey(decodedToken.apiKey || null);
        setUser({
          id: decodedToken.user_id,
          username: decodedToken.username,
          balance: balance,
        });
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
      setLoading(false);
      return;
    }
    fetch("/api/users/@me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Ensure cookies are sent with the request
    })
      .then(async (res) => {
        if (res.status === 200) {
          const user = await res.json();
          setUser(user);
          cacheUser(user);
          if (user.balance !== undefined) {
            setBalance(user.balance);
            document.cookie = `balance=${user.balance}; path=/;`;
          }
        } else if (res.status === 401) {
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "balance=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          setUser(null);
          setTokenState(null);
          setBalance(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Met à jour le cookie balance quand la balance change
  useEffect(() => {
    if (balance !== null && !isNaN(balance)) {
      document.cookie = `balance=${balance}; path=/;`;
    }
  }, [balance]);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, token, apiKey, balance, setBalance }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}
