import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useAuth from "../../hooks/useAuth";

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      isOauth2Auth: true,
    },
  };
}

export default function OAuth2Auth() {
  const { t } = useTranslation("common");
  const [params, setParams] = useState<{
    client_id?: string;
    redirect_uri?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFromApp, setUserFromApp] = useState<any | null>(null);
  const { user, loading: authLoading, token } = useAuth();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams({
      client_id: search.get("client_id") || undefined,
      redirect_uri: search.get("redirect_uri") || undefined,
    });
    if (search.get("client_id")) {
      fetch("/api/oauth2/app/" + search.get("client_id"))
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch application info.");
        })
        .then((data) => {
          setUserFromApp(data);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [token]);

  const handleLogin = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
  };

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/oauth2/authorize?client_id=${encodeURIComponent(params.client_id!)}&redirect_uri=${encodeURIComponent(params.redirect_uri!)}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Authorization error.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      window.location.href = `${params.redirect_uri}?code=${encodeURIComponent(data.code)}`;
    } catch (e) {
      setError("Network error.");
      setLoading(false);
    }
  };

  // Toujours afficher le squelette, même si params manquants
  const missingParams = !params.client_id || !params.redirect_uri;

  return (
    <div className="glass-page-container flex justify-center items-center min-h-screen">
      <div className="glass-content-card w-full mx-auto mt-0 rounded-[18px] shadow-xl p-7 text-white font-['Segoe_UI',Arial,sans-serif] flex flex-col items-center justify-start relative">
        {/* App Info Section */}
        <div className="flex items-center gap-[18px] mb-4 w-full justify-center">
          <img src="/assets/icons/favicon-96x96.avif" alt="App avatar" className="w-14 h-14 rounded-2xl bg-[#333] object-cover shadow-md" />
          <div>
            <div className="text-[0.98rem] text-[#bdbdbd]">
              {t("oauth2.auth.authorize")} <b className="text-white">{userFromApp?.name || "Unknown application"}</b> {t("oauth2.auth.accessData")}
            </div>
          </div>
        </div>

        {/* Contenu Principal avec espace réservé pour les boutons */}
        <div className="w-full flex-1 flex flex-col min-h-[80px] mb-8">
          {/* Error Message */}
          {(error || missingParams) && <div className="text-white bg-red-700 rounded-lg px-[14px] py-[10px] text-[1.01rem] text-center w-full">{missingParams ? t("oauth2.auth.missingParams") : error}</div>}
        </div>

        {/* Bottom Buttons Section */}
        <div className="w-full flex flex-col items-center gap-3 mb-6">
          {!authLoading && !user && !missingParams && (
            <button onClick={handleLogin} className="w-full glass-button">
              {t("oauth2.auth.login")}
            </button>
          )}
          {!authLoading && user && !missingParams && (
            <button
              onClick={handleAuth}
              disabled={loading}
              className={`w-full glass-button-neon ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? t("oauth2.auth.authorizing") : t("oauth2.auth.authorizeButton")}
            </button>
          )}
        </div>

        {/* Redirect Info */}
        <div className="w-full text-center text-[0.82rem] text-[#888] opacity-85 px-6 break-all select-text">
          {t("oauth2.auth.redirectUri")} {params.redirect_uri || <span className="text-red-700">N/A</span>}
        </div>
      </div>
    </div>
  );
}
