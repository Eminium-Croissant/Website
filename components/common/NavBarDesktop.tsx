import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import useAuth from "../../hooks/useAuth";
import CachedImage from "../utils/CachedImage";
import Searchbar from "../Searchbar";
import Certification from "./Certification";

export default function NavBarDesktop() {
  const { user, loading, setUser } = useAuth();
  const [show, setShow] = useState("");

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  // Groupe de liens desktop
  function DesktopLinks() {
    const { t } = useTranslation("common");
    return (
      <>
        <Link href="/api-docs" className="no-underline px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow text-xs font-medium">
          {t("navbar.docs")}
        </Link>
        <Link href="/game-shop" className="no-underline px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow text-xs font-medium">
          {t("navbar.shop")}
        </Link>
        <Link href="/marketplace" className="no-underline px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow text-xs font-medium">
          {t("navbar.marketplace")}
        </Link>
        <DropdownButton label={t("navbar.install")} showKey="install">
          {show === "install" && (
            <div className="absolute top-full left-0 mt-2 min-w-[160px] z-50 flex flex-col bg-glass-primary border border-glass-border rounded-xl shadow-glass p-1">
              <Link href="/download-launcher" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                {t("navbar.launcher")}
              </Link>
              <Link href="https://github.com/Croissant-API/Croissant-VPN/releases" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                {t("navbar.vpn")}
              </Link>
              <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium">
                {t("navbar.bot")}
              </a>
            </div>
          )}
        </DropdownButton>
        {!loading && user && (
          <DropdownButton label={t("navbar.manage")} showKey="manage">
            {show === "manage" && (
              <div className="absolute top-full left-0 mt-2 min-w-[160px] z-50 flex flex-col bg-glass-primary border border-glass-border rounded-xl shadow-glass p-1">
                {!user.isStudio && (
                  <Link href="/studios" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                    {t("navbar.studios")}
                  </Link>
                )}
                <Link href="/oauth2/apps" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                  {t("navbar.oauth2")}
                </Link>
                <Link href="/dev-zone/my-items" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                  {t("navbar.items")}
                </Link>
                <Link href="/dev-zone/my-games" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                  {t("navbar.games")}
                </Link>
                <Divider />
                <Link href="/settings" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium">
                  {t("navbar.settings")}
                </Link>
              </div>
            )}
          </DropdownButton>
        )}
        <Link href="/login" className="glass-button-neon text-white no-underline px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-xs font-medium">
          {t("navbar.login")}
        </Link>
        {user && !loading && (
          <button
            onClick={handleLogout}
            className="glass-button text-white border-none rounded-xl py-2 px-4 cursor-pointer transition-all duration-300 ml-3 flex items-center gap-2 hover:scale-105 text-xs font-medium"
            title="Logout"
          >
            <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
          </button>
        )}
      </>
    );
  }

  // Dropdown utilitaire
  const DropdownButton = ({ label, showKey, children }: any) => (
    <div className="inline-block relative">
      <button
        className="cursor-pointer bg-transparent border-none outline-none inline-flex items-center gap-1 text-glass-text-secondary px-2 py-1 rounded-xl hover:bg-glass-accent transition-all duration-200 text-xs font-medium"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === showKey ? "" : showKey));
        }}
      >
        {label} <span className="text-xs">▼</span>
      </button>
      {show === showKey && children}
    </div>
  );

  // Convertir la ligne HR en div avec Tailwind
  const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent my-3" />
  );

  // Bloc crédits + avatar + sélecteur de rôle
  const UserBlock = ({ loading, user }: any) => (
    <div className="inline-flex items-center gap-2 ml-2">
      <Link href="/buy-credits" className="no-underline">
        <div className="flex items-center glass-card rounded-xl px-2 py-1 transition-all duration-300 hover:scale-105 hover:shadow-glass-glow">
          <CachedImage src="/assets/credit.avif" className="w-4 h-4 mr-1" />
          <div className="text-glass-text-secondary text-xs font-medium">
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              {loading ? "..." : user?.balance}
            </span>
          </div>
        </div>
      </Link>
      <Link href="/profile" className="group">
        <div className="relative">
          <CachedImage
            src={
              loading
                ? "/avatar/default.avif"
                : `/avatar/${user.role || user.id}`
            }
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300 group-hover:border-neon-blue group-hover:shadow-glass-glow"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </Link>
      <button
        className="text-glass-text-secondary px-2 py-1 rounded-xl cursor-pointer glass-card border-none inline-flex items-center gap-1 transition-all duration-300 hover:shadow-glass-glow text-xs font-medium"
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => (prev === "roles" ? "" : "roles"));
        }}
      >
        <span className="text-xs transition-transform duration-300">▼</span>
      </button>
    </div>
  );

  // Menu déroulant des rôles
  const RolesDropdown = ({ user }: any) => (
    <div
      className="glass-dropdown min-w-[140px] w-[220px]"
      onMouseLeave={() => setShow("")}
    >
      {user?.roles.map((role: any) => {
        const studio = user.studios.find(
          (studio: any) => studio.user_id === role
        );
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
                .then((res) =>
                  res.ok ? res.json() : Promise.reject("Failed to change role")
                )
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
              <CachedImage
                src={"/avatar/" + role}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <span className="whitespace-nowrap font-medium text-glass-text text-xs">
              {studio?.me.username || "Me"}
              <Certification
                user={studio ? { ...studio, isStudio: true } : studio}
                className="w-3 h-3 ml-1 relative -top-0.5 align-middle"
              />
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
            <Link
              href="/"
              className="text-glass-text no-underline font-bold text-2xl tracking-wider transition-all duration-300 hover:scale-105"
            >
              <span className="cursor-pointer flex items-center group">
                <div className="relative">
                  <CachedImage
                    src="/assets/icons/favicon-32x32.avif"
                    alt="Croissant Logo"
                    className="w-10 h-10 relative -top-1 align-middle mr-4 transition-all duration-300 group-hover:animate-glass-glow"
                  />
                  <div className="absolute inset-0 bg-neon-blue opacity-0 group-hover:opacity-30 rounded-full blur-sm transition-opacity duration-300"></div>
                </div>
                <div className="inline-flex items-center font-black relative text-xl -top-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  CROISSANT
                </div>
              </span>
            </Link>
          </div>
          <Searchbar />
          <nav>
            <div className="flex items-center gap-4 mt-0 flex-row relative">
              {show === "roles" && user && <RolesDropdown user={user} />}
              {user && <UserBlock loading={loading} user={user} />}
              <DesktopLinks />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
