import "../styles/main.css";
// import "../styles/phone.css";
import "../styles/atom-one-dark.min.css";
import "../styles/rarity.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import MetaLinks from "../components/common/MetaLinks";
import Footer from "../components/common/Footer";
import ImagePreloader from "../components/utils/ImagePreloader";

import { useEffect, useState } from "react";
import LauncherNavbar from "./launcher/components/Navbar";
import LauncherLobby from "./launcher/components/Lobby";
import useAuth from "../hooks/useAuth";
import { AuthProvider } from "../hooks/AuthContext";
import { UserCacheProvider } from "../hooks/UserCacheContext";
import { ImageCacheProvider } from "../hooks/ImageCacheContext";
import useIsMobile from "../hooks/useIsMobile";
import NavBarDesktop from "../components/common/NavBarDesktop";
import NavBarMobile from "../components/common/NavBarMobile";
import { LobbyProvider } from "../hooks/LobbyContext";
import { appWithTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getMetaLinksProps } from "../components/common/metaLinks.server";
import "github-markdown-css/github-markdown.css";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      ...await getMetaLinksProps(locale),
    },
  };
}

function AppContent({ Component, pageProps }: AppProps) {
  const [isLauncher, setIsLauncher] = useState(false);
  const { user } = useAuth();
  const [mainStyle, setMainStyle] = useState<string>("");

  // Set main style based on whether it's a launcher or not
  useEffect(() => {
    setMainStyle(window.location.href.includes("/oauth2/auth") ? "flex justify-center items-center p-0 m-auto h-[calc(100vh-30px)] top-0 left-0 right-0 bottom-0 fixed" : "");
  }, []);

  // Determine launcher mode synchronously to avoid hydration errors
  const isLauncherPath = typeof window !== "undefined" && window.location.pathname.startsWith("/launcher");
  const isFromLauncher = typeof document !== "undefined" && document.cookie.includes("from=app");
  useEffect(() => {
    // Set app height for CSS variable
    const setAppHeight = () => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  useEffect(() => {
    setIsLauncher(isLauncherPath || isFromLauncher);
  }, [isLauncherPath, isFromLauncher]);

  // --- Background image component with shooting stars ---
  const BackgroundImage = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return (
        <div className="fixed -z-10 top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden object-cover bg-dark-gradient" aria-hidden="true">
          {/* Image de fond très subtile */}
          <img src="/assets/backgrounds/raiden-crow.webp" alt="background" className="absolute top-0 left-0 w-screen h-screen object-cover opacity-5 blur-[3px] transition-opacity duration-800 max-w-full" />

          {/* Overlay sombre */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-primary/20 to-dark-secondary/40"></div>
        </div>
      );
    }

    return (
      <div className="fixed -z-10 top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden object-cover bg-dark-gradient" aria-hidden="true">
        {/* Image de fond très subtile */}
        <img src="/assets/backgrounds/raiden-crow.webp" alt="background" className="absolute top-0 left-0 w-screen h-screen object-cover opacity-5 blur-[3px] transition-opacity duration-800 max-w-full" />
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-primary/20 to-dark-secondary/40"></div>
        {/* Champ d'étoiles statiques */}
        {/* <div className="absolute inset-0"> */}
        {/* Étoiles blanches */}
        {/* <div className="twinkling-star" style={{ top: "10%", left: "20%", animationDelay: "0s" }}></div>
          <div className="twinkling-star" style={{ top: "15%", left: "80%", animationDelay: "1s" }}></div>
          <div className="twinkling-star" style={{ top: "25%", left: "60%", animationDelay: "2s" }}></div>
          <div className="twinkling-star" style={{ top: "35%", left: "30%", animationDelay: "0.5s" }}></div>
          <div className="twinkling-star" style={{ top: "45%", left: "70%", animationDelay: "1.5s" }}></div>
          <div className="twinkling-star" style={{ top: "55%", left: "10%", animationDelay: "2.5s" }}></div>
          <div className="twinkling-star" style={{ top: "65%", left: "90%", animationDelay: "0.8s" }}></div>
          <div className="twinkling-star" style={{ top: "75%", left: "40%", animationDelay: "1.8s" }}></div>
          <div className="twinkling-star" style={{ top: "85%", left: "85%", animationDelay: "2.2s" }}></div>
          <div className="twinkling-star" style={{ top: "95%", left: "15%", animationDelay: "0.3s" }}></div> */}

        {/* Étoiles bleues */}
        {/* <div className="twinkling-star" style={{ top: "12%", left: "45%", animationDelay: "1.2s", background: "#87CEEB" }}></div>
          <div className="twinkling-star" style={{ top: "28%", left: "75%", animationDelay: "2.8s", background: "#87CEEB" }}></div>
          <div className="twinkling-star" style={{ top: "42%", left: "25%", animationDelay: "0.7s", background: "#87CEEB" }}></div>
          <div className="twinkling-star" style={{ top: "58%", left: "55%", animationDelay: "1.9s", background: "#87CEEB" }}></div>
          <div className="twinkling-star" style={{ top: "72%", left: "95%", animationDelay: "2.1s", background: "#87CEEB" }}></div> */}

        {/* Étoiles dorées */}
        {/* <div className="twinkling-star" style={{ top: "18%", left: "35%", animationDelay: "1.6s", background: "#FFD700" }}></div>
          <div className="twinkling-star" style={{ top: "38%", left: "65%", animationDelay: "0.4s", background: "#FFD700" }}></div>
          <div className="twinkling-star" style={{ top: "68%", left: "5%", animationDelay: "2.3s", background: "#FFD700" }}></div>
          <div className="twinkling-star" style={{ top: "88%", left: "50%", animationDelay: "1.4s", background: "#FFD700" }}></div> */}
        {/* </div> */}
        {/* Étoiles filantes */}
        {/* <div className="absolute inset-0">
          <div className="shooting-star" style={{top: '20%', left: '0%', animationDelay: '0s'}}></div>
          <div className="shooting-star" style={{top: '40%', left: '0%', animationDelay: '2s'}}></div>
          <div className="shooting-star" style={{top: '60%', left: '0%', animationDelay: '4s'}}></div>
          <div className="shooting-star" style={{top: '80%', left: '0%', animationDelay: '6s'}}></div>
          <div className="shooting-star" style={{top: '30%', left: '0%', animationDelay: '8s'}}></div>
          <div className="shooting-star" style={{top: '50%', left: '0%', animationDelay: '10s'}}></div>
          <div className="shooting-star" style={{top: '70%', left: '0%', animationDelay: '12s'}}></div>
          <div className="shooting-star" style={{top: '90%', left: '0%', animationDelay: '14s'}}></div>
        </div> */}
        {/* Particules flottantes subtiles */}
        {/* <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-glass-accent rounded-full opacity-20 animate-star-float"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-glass-primary rounded-full opacity-15 animate-star-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-glass-secondary rounded-full opacity-10 animate-star-float" style={{animationDelay: '6s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-glass-accent rounded-full opacity-12 animate-star-float" style={{animationDelay: '9s'}}></div>
          <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-glass-primary rounded-full opacity-18 animate-star-float" style={{animationDelay: '12s'}}></div>
        </div> */}
      </div>
    );
  };

  // --- Layouts ---
  const LauncherLayout = () => (
    <>
      <BackgroundImage />
      <MetaLinks metaLinksTitle={"Croissant Launcher"} />
      <ImagePreloader images={["/assets/backgrounds/raiden-crow.webp"]} priority={true} />
      <nav className="flex px-4 py-0 border-b border-[#ddd] justify-start fixed w-full bg-[#222]">
        <img src="/assets/icons/favicon-32x32.avif" alt="Icon" className="w-6 h-6" />
        <span className="relative top-0.5 -right-2.5">Croissant Launcher</span>
      </nav>
      <LauncherNavbar />
      <main className="fixed inset-x-0 top-28 bottom-0 overflow-x-hidden overflow-y-auto launcher">
        <Component {...pageProps} />
      </main>
      <LauncherLobby />
    </>
  );

  const WebsiteLayout = () => {
    const isMobile = useIsMobile();

    return (
      <div>
        <BackgroundImage />
        <MetaLinks metaLinksTitle={pageProps?.title} />
        {!pageProps?.isOauth2Auth && !pageProps?.isLauncher && (isMobile ? <NavBarMobile /> : <NavBarDesktop />)}
        <main className={`${mainStyle}`}>
          <Component {...pageProps} />
        </main>
        {!pageProps?.isOauth2Auth && !pageProps?.isLauncher && <Footer />}
      </div>
    );
  };

  if (isLauncher) {
    return <LauncherLayout />;
  }
  return <WebsiteLayout />;
}

export function App(props: AppProps) {
  return (
    <ImageCacheProvider>
      <UserCacheProvider>
        <AuthProvider>
          <LobbyProvider>
            <AppContent {...props} />
          </LobbyProvider>
        </AuthProvider>
      </UserCacheProvider>
    </ImageCacheProvider>
  );
}

export default appWithTranslation(App);
