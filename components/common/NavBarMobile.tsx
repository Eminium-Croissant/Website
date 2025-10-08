import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Searchbar from "../Searchbar";
import CachedImage from "../utils/CachedImage";

export default function NavBarMobile() {
  const { user, loading, setUser } = useAuth();
  const { t } = useTranslation("common");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      setTimeout(() => setDrawerVisible(true), 10);
    } else {
      setDrawerVisible(false);
    }
  }, [drawerOpen]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    setUser(null);
  };

  
  const UserBlock = ({ loading, user }: any) => (
    <div className="flex items-center gap-3 mb-4">
      <Link href="/buy-credits">
        <div className="flex items-center bg-secondary rounded-lg px-3 py-2">
          <CachedImage src="/assets/credit.avif" className="w-5 h-5" />
          <span className="text-[#bdbdbd] text-base font-semibold ml-2">
            {loading ? "..." : user?.balance}
          </span>
        </div>
      </Link>
      <Link href="/profile">
        <CachedImage
          src={
            loading
              ? "/avatar/default.avif"
              : `/avatar/${user.role || user.id}`
          }
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-secondary"
        />
      </Link>
      <button
        className="text-[#bdbdbd] p-1 rounded cursor-pointer bg-transparent border-none inline-flex items-center font-semibold text-lg"
        onClick={() => setShowRoles((prev) => !prev)}
      >
        <span className="text-sm">▼</span>
      </button>
      <button
        onClick={handleLogout}
        className="bg-secondary text-white border-none rounded-lg py-2 px-3 cursor-pointer text-base hover:bg-[#2a2b31] transition-colors"
        title="Logout"
      >
        <i className="fa fa-sign-out-alt" aria-hidden="true"></i>
      </button>
    </div>
  );

  
  const RolesDropdown = ({ user }: any) => (
    <div className="bg-secondary border border-[#35363b] rounded-md min-w-[140px] shadow-lg z-50 mb-2.5 mt-0.5 p-1">
      {user?.roles.map((role: any) => {
        const studio = user.studios.find(
          (studio: any) => studio.user_id === role
        );
        return (
          <button
            className="w-full flex items-center gap-2 text-[#bdbdbd] hover:bg-[#2a2b31] rounded transition-colors px-0 py-1.5 text-left bg-transparent border-none"
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
                  setShowRoles(false);
                })
                .catch((err) => console.error(err));
            }}
          >
            <CachedImage
              src={"/avatar/" + role}
              alt="avatar"
              className="w-6 h-6 rounded-full object-cover border border-secondary ml-1.5"
            />
            <span className="whitespace-nowrap">
              {studio?.me.username || "Me"}
            </span>
          </button>
        );
      })}
    </div>
  );

  
  function MobileLinks() {
    return (
      <div className="flex flex-col space-y-1 w-full">
        <div className="space-y-1">
          <Link
            href="/api-docs"
            className="nav-link"
          >
            {t("navbar.docs")}
          </Link>
          <Link
            href="/game-shop"
            className="nav-link"
          >
            {t("navbar.shop")}
          </Link>
          <Link
            href="/marketplace"
            className="nav-link"
          >
            {t("navbar.marketplace")}
          </Link>
        </div>

        <div className="space-y-1 pt-2 border-t border-[#35363b]">
          <Link
            href="/download-launcher"
            className="nav-link"
          >
            {t("navbar.downloadLauncher")}
          </Link>
          <Link
            href="https://github.com/Croissant-API/Croissant-VPN/releases"
            className="nav-link"
          >
            {t("navbar.vpn")}
          </Link>
          <a
            href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"
            className="nav-link"
          >
            {t("navbar.discordBot")}
          </a>
        </div>

        {!loading && user && (
          <div className="space-y-1 pt-2 border-t border-[#35363b]">
            <Link
              href="/studios"
              className="nav-link"
            >
              {t("navbar.studios")}
            </Link>
            <Link
              href="/oauth2/apps"
              className="nav-link"
            >
              {t("navbar.oauth2")}
            </Link>
            <Link
              href="/settings"
              className="nav-link"
            >
              {t("navbar.settings")}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="w-full bg-[#23242a] text-[#e2e8f0] border-b border-secondary py-0.5 shadow-sm relative z-10"> {}
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full px-4 h-14 relative">
          {}
          <button
            className="bg-transparent border-none text-[#e2e8f0] text-3xl cursor-pointer flex-none z-20"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            &#9776;
          </button>

          {}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link
              href="/"
              className="text-[#f3f3f3] no-underline font-bold text-lg tracking-wide pointer-events-auto"
            >
              <span className="cursor-pointer flex items-center">
                <CachedImage
                  src="/assets/icons/favicon-32x32.avif"
                  alt="Croissant Logo"
                  className="w-7 h-7 relative align-middle mr-1.5"
                />
                <div className="inline-flex items-center font-black text-2xl">
                  CROISSANT
                </div>
              </span>
            </Link>
          </div>

          {}
          <div className="w-8 flex-none" />
        </div>
      </div>

      {}
      <nav>
        {drawerOpen && (
          <>
            {}
            <div
              className={`fixed top-0 left-0 w-[85vw] max-w-[380px] h-screen bg-[#23242a] z-[9999] shadow-lg flex flex-col transition-transform duration-250 ease-[cubic-bezier(.4,0,.2,1)] ${
                drawerVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0"
              }`}
            >
              {}
              <div className="flex items-center gap-3 p-5 border-b border-[#35363b]">
                <div className="flex-1 min-w-0">
                  <Searchbar />
                </div>
                <button
                  className="flex-none text-[#e2e8f0] text-2xl leading-none hover:text-white transition-colors"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                >
                  &times;
                </button>
              </div>

              {}
              <div className="flex-1 overflow-y-auto p-5">
                {}
                {!user && !loading && (
                  <Link href="/login" legacyBehavior>
                    <span className="text-[#8fa1c7] font-semibold bg-[#23242a] rounded px-3 py-1 text-sm block">
                      Login
                    </span>
                  </Link>
                )}
                {user && (
                  <div className="flex flex-col items-center w-full">
                    <UserBlock loading={loading} user={user} />
                    {showRoles && <RolesDropdown user={user} />}
                  </div>
                )}
                <MobileLinks />
              </div>
            </div>

            {}
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/25 z-[9998]"
            />
          </>
        )}
      </nav>
    </header>
  );
}

