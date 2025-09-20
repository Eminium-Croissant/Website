import React, { useState } from "react";
import Link from "next/link";
import SearchBar from "../../../components/Searchbar";
import useAuth from "../../../hooks/useAuth";
import CachedImage from "../../../components/utils/CachedImage";
import Certification from "../../../components/common/Certification";

const Navbar: React.FC = () => {
  const { user, token, setUser, loading } = useAuth();
  const [show, setShow] = useState("");

  if (!token) return null;

  // Bloc crédits + avatar + sélecteur de rôle
  const UserBlock = ({ user }: any) => (
    <div className="inline-flex items-center gap-2 ml-2">
      <Link href="/buy-credits" className="no-underline">
        <div className="flex items-center glass-card rounded-xl px-2 py-1 transition-all duration-300 hover:scale-105 hover:shadow-glass-glow">
          <CachedImage src="/assets/credit.avif" className="w-4 h-4 mr-1" />
          <div className="text-glass-text-secondary text-xs font-medium">
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">{user?.balance}</span>
          </div>
        </div>
      </Link>
      <Link href="/profile" className="group">
        <div className="relative">
          <CachedImage src={`/avatar/${user.role || user.id}`} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300 group-hover:border-neon-blue group-hover:shadow-glass-glow" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </Link>
      {user?.roles?.length > 1 && (
        <button
          className="text-glass-text-secondary px-2 py-1 rounded-xl cursor-pointer glass-card border-none inline-flex items-center gap-1 transition-all duration-300 hover:shadow-glass-glow text-xs font-medium"
          onClick={(e) => {
            e.preventDefault();
            setShow((prev) => (prev === "roles" ? "" : "roles"));
          }}
        >
          <span className="text-xs transition-transform duration-300">▼</span>
        </button>
      )}
    </div>
  );

  // Menu déroulant des rôles
  const RolesDropdown = ({ user }: any) => (
    <div className="glass-dropdown min-w-[140px] w-[220px] absolute top-full right-0 z-50" onMouseLeave={() => setShow("")}>
      {user?.roles.map((role: any) => {
        const studio = user.studios?.find((studio: any) => studio.user_id === role);
        return (
          <button
            className="w-full text-left p-2 flex items-center gap-2 text-glass-text-secondary hover:bg-glass-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glass-glow text-xs font-medium"
            key={role}
            onClick={async () => {
              await fetch("/api/users/change-role", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ role }),
              });
              const res = await fetch("/api/users/@me", {
                headers: { "Content-Type": "application/json" },
              });
              const userData = await res.json();
              setUser(userData);
              setShow("");
            }}
          >
            <div className="relative">
              <CachedImage src={"/avatar/" + role} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-glass-border transition-all duration-300" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <span className="whitespace-nowrap font-medium text-glass-text text-xs">
              {studio?.me?.username || "Me"}
              <Certification user={studio ? { ...studio, isStudio: true } : studio} className="w-3 h-3 ml-1 relative -top-0.5 align-middle" />
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <div
        className="electron-dragbar flex items-center px-4"
        style={{
          height: "32px",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          background: "#333", // fond uni gris
        }}
      >
        <img src="/assets/icons/favicon-32x32.avif" alt="Croissant Icon" className="w-6 h-6 mr-3"/>
        <span className="text-white font-bold text-base">
          Croissant Launcher
        </span>
      </div>
      <header className="w-full glass-bg-gradient text-glass-text border-b border-glass-border py-3 shadow-glass relative z-10 backdrop-blur-md" style={{ marginTop: 32 }}>
        <div className="flex items-center justify-between max-w-[1400px] mx-auto px-6">
          <div className="flex items-center mr-8">
            <Link href="/launcher/home" className="text-glass-text no-underline font-bold text-2xl tracking-wider transition-all duration-300 hover:scale-105">
              <span className="cursor-pointer flex items-center group">
                <div className="relative">
                  <CachedImage src="/assets/icons/favicon-32x32.avif" alt="Croissant Logo" className="w-10 h-10 relative -top-1 align-middle mr-4 transition-all duration-300 group-hover:animate-glass-glow" />
                  <div className="absolute inset-0 bg-neon-blue opacity-0 group-hover:opacity-30 rounded-full blur-sm transition-opacity duration-300"></div>
                </div>
                <div className="inline-flex items-center font-black relative text-xl -top-0.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">CROISSANT</div>
              </span>
            </Link>
          </div>
          <SearchBar />
          <nav>
            <div className="flex items-center gap-4 mt-0 flex-row relative">
              {show === "roles" && user && <RolesDropdown user={user} />}
              {user && <UserBlock user={user} />}
              <Link href="/game-shop" className="no-underline px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow text-xs font-medium">
                Shop
              </Link>
              <Link href="/launcher/home" className="no-underline px-2 py-1 rounded-xl transition-all duration-300 hover:scale-105 text-glass-text-secondary hover:text-neon-blue hover:bg-glass-accent hover:shadow-glass-glow text-xs font-medium">
                Library
              </Link>
              <div className="inline-block relative">
                <button
                  className="cursor-pointer bg-transparent border-none outline-none inline-flex items-center gap-1 text-glass-text-secondary px-2 py-1 rounded-xl hover:bg-glass-accent transition-all duration-200 text-xs font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    setShow((prev) => (prev === "manage" ? "" : "manage"));
                  }}
                >
                  Manage <span className="text-xs">▼</span>
                </button>
                {show === "manage" && (
                  <div className="absolute top-full left-0 mt-2 min-w-[160px] z-50 flex flex-col bg-glass-primary border border-glass-border rounded-xl shadow-glass p-1">
                    <Link href="/studios" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                      Studios
                    </Link>
                    <Link href="/oauth2/apps" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                      OAuth2
                    </Link>
                    <Link href="/dev-zone/my-items" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                      My Items
                    </Link>
                    <Link href="/dev-zone/my-games" className="block w-full text-left px-2 py-2 rounded-lg hover:bg-glass-accent text-xs font-medium mb-1">
                      My Games
                    </Link>
                  </div>
                )}
              </div>
              <button
                className="glass-button text-white border-none rounded-xl py-2 px-4 cursor-pointer transition-all duration-300 ml-3 flex items-center gap-2 hover:scale-105 text-xs font-medium"
                title="Logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("verificationKey");
                  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  location.reload();
                }}
              >
                <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;
