import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import Searchbar from "../Searchbar";
import CachedImage from "../utils/CachedImage";

export default function NavBarDesktop() {
  const { user, loading, setUser } = useAuth();
  const [show, setShow] = useState("");

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  
  function DesktopLinks() {
    const { t } = useTranslation("common");
    const rectBtn = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs flex items-center";
    return (
      <>
        <Link href="/api-docs" className={`${rectBtn} text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow no-underline`}>
          {t("navbar.docs")}
        </Link>
        <Link href="/game-shop" className={`${rectBtn} text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow no-underline`}>
          {t("navbar.shop")}
        </Link>
        <Link href="/marketplace" className={`${rectBtn} text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow no-underline`}>
          {t("navbar.marketplace")}
        </Link>
        <DropdownButton label={t("navbar.install")} showKey="install">
            {show === "install" && (
              <div className="absolute top-full left-0 mt-2 min-w-[160px] z-50 flex flex-col bg-glass-primary border border-glass-border rounded-xl shadow-glass p-1" onMouseLeave={() => setShow("")}>
                <Link href="/download-launcher" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                  {t("navbar.launcher")}
                </Link>
                <Link href="https://github.com/Croissant-API/Croissant-VPN/releases" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                  {t("navbar.vpn")}
                </Link>
                <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923" className={`${rectBtn} block w-full text-left hover:bg-glass-accent`} onClick={() => setShow("")}>
                  {t("navbar.bot")}
                </a>
              </div>
            )}
        </DropdownButton>
        {!loading && user && (
          <DropdownButton label={t("navbar.manage")} showKey="manage">
              {show === "manage" && (
                <div className="absolute top-full left-0 mt-2 min-w-[160px] z-50 flex flex-col bg-glass-primary border border-glass-border rounded-xl shadow-glass p-1" onMouseLeave={() => setShow("")}>
                  {!user.isStudio && (
                    <Link href="/studios" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                      {t("navbar.studios")}
                    </Link>
                  )}
                  <Link href="/oauth2/apps" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                    {t("navbar.oauth2")}
                  </Link>
                  <Link href="/dev-zone/my-items" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                    {t("navbar.items")}
                  </Link>
                  <Link href="/dev-zone/my-games" className={`${rectBtn} block w-full text-left mb-1 hover:bg-glass-accent`} onClick={() => setShow("")}>
                    {t("navbar.games")}
                  </Link>
                  <Divider />
                  <Link href="/settings" className={`${rectBtn} block w-full text-left hover:bg-glass-accent`} onClick={() => setShow("")}>
                    {t("navbar.settings")}
                  </Link>
                </div>
              )}
          </DropdownButton>
        )}
        {!user && !loading && (
          <Link href="/login" className={`${rectBtn} bg-neon-blue text-white no-underline`}>
            {t("navbar.login")}
          </Link>
        )}
      </>
    );
  }

  const DropdownButton = ({ label, showKey, children }: any) => (
    <div className="inline-block relative">
      <button
        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs flex items-center text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === showKey ? "" : showKey));
        }}
      >
        {label} <span className="text-xs ml-1">▼</span>
      </button>
      {show === showKey && children}
    </div>
  );

  
  const Divider = () => <div className="h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent my-3" />;

  const rectBtn = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-xs flex items-center";
  
  const UserBlock = ({ loading, user }: any) => (
    <div className="inline-flex items-center gap-2 ml-2">
      <Link href="/buy-credits" className="no-underline">
        <div className="nav-rect-btn flex items-center px-4 py-2">
          <CachedImage src="/assets/credit.avif" className="w-4 h-4 mr-1" />
          <div className="text-glass-text-secondary text-xs font-medium">
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">{loading ? "..." : user?.balance}</span>
          </div>
        </div>
      </Link>
      <Link href="/profile" className="group">
        <div className="nav-rect-btn relative px-4 py-2 flex items-center">
          <CachedImage src={loading ? "/avatar/default.avif" : `/avatar/${user.role || user.id}`} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300 group-hover:border-neon-blue group-hover:shadow-glass-glow" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </Link>
      <button
        className="nav-rect-btn px-4 py-2 cursor-pointer flex items-center gap-1 text-glass-text-secondary border-none text-xs font-medium transition-all duration-300"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === "roles" ? "" : "roles"));
        }}
      >
        <span className="text-xs transition-transform duration-300">▼</span>
      </button>

      <button onClick={handleLogout} className={`${rectBtn} bg-glass-accent text-white border-none ml-3 gap-2`} title="Logout">
        <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
      </button>
    </div>
  );

  
  const RolesDropdown = ({ user }: any) => (
    <div className="glass-dropdown min-w-[140px] w-[220px]" onMouseLeave={() => setShow("")}>
      {user?.roles.map((role: any) => {
        const studio = user.studios.find((studio: any) => studio.user_id === role);
        return (
          <button
            className="w-full text-left p-2 flex items-center gap-2 text-glass-text-secondary hover:bg-glass-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glass-glow text-xs font-medium"
            key={role}
            onClick={() => {
              fetch("/api/users/change-role", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ role }),
              })
                .then((res) => (res.ok ? res.json() : Promise.reject("Failed to change role")))
                .then(() =>
                  fetch("/api/users/@me", {
                    headers: { "Content-Type": "application/json" },
                  })
                )
                .then((res) => res.json())
                .then((userData) => {
                  setUser(userData);
                  setShow("");
                })
                .catch((err) => console.error(err));
            }}
          >
            <div className="relative">
              <CachedImage src={"/avatar/" + role} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <span className="whitespace-nowrap font-medium text-glass-text text-xs">
              {studio?.me.username || "Me"}
              
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <header className="w-full glass-bg-gradient text-glass-text border-b border-glass-border py-3 shadow-glass relative z-10 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between w-full h-16">
          <div className="flex items-center mr-8">
            <Link href="/" className="text-glass-text no-underline font-bold text-2xl tracking-wider transition-all duration-300 hover:scale-105">
              <span className="cursor-pointer flex items-center group">
                <div className="relative">
                  <CachedImage src="/assets/icons/favicon-32x32.avif" alt="Croissant Logo" className="w-10 h-10 relative -top-1 align-middle mr-4 transition-all duration-300" />
                  
                </div>
                <div className="inline-flex items-center font-black relative text-xl -top-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">CROISSANT</div>
              </span>
            </Link>
          </div>
          <Searchbar />
          <nav>
            <div className="flex items-center gap-4 mt-0 flex-row relative">
              <DesktopLinks />
              {user && <UserBlock loading={loading} user={user} />}
              {show === "roles" && user && (
                <div className="absolute right-0 top-full mt-2 -translate-x-[300px]">
                  <RolesDropdown user={user} />
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}


