import React, { useCallback, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CachedImage from "../components/utils/CachedImage";
import TradePanel from "../components/TradePanel";
import useIsMobile from "../hooks/useIsMobile";
import Inventory from "../components/Inventory";
import Certification from "../components/common/Certification";
import { useTranslation, Trans } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getServerSideProps({ locale, query }) {
  const translations = await serverSideTranslations(locale, ["common"]);
  let profileFromQuery = null;
  const userId = query?.user || null;
  let ogMeta = null;
  if (userId) {
    try {
      const res = await fetch(`https://croissant-api.fr/api/users/${userId}`);
      if (res.ok) {
        const user = await res.json();
        ogMeta = {
          title: user.username,
          description: `Check out ${user.username}'s profile on Croissant!`,
          bannerUrl: `https://croissant-api.fr/avatar/${user.id}`,
          // profileUrl: `https://croissant-api.fr/profile?user=${user.id}`,
          query: { user: user.id },
          card: false,
        };
        profileFromQuery = user;
      }
    } catch {}
  }

  return {
    props: {
      ...translations,
      ogMeta,
      profileFromQuery,
    },
  };
}
const endpoint = "/api";

function ProfileShopModal({ open, onClose, user, onBuySuccess }) {
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt" style={{ minWidth: 400, maxWidth: 600 }}>
        <button style={{ float: "right" }} onClick={onClose}>
          ✕
        </button>
        <ProfileShop user={user} onBuySuccess={onBuySuccess} />
      </div>
    </div>
  );
}

// --- Give Credits Modal ---
function GiveCreditsModal({ open, onClose, onSubmit, maxAmount, username }) {
  const { t } = useTranslation("common");
  const [amount, setAmount] = useState(1);
  useEffect(() => {
    if (open) setAmount(1);
  }, [open]);
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
        <div className="shop-prompt-message">
          <Trans i18nKey="profile.giveCreditsTo" values={{ username }} components={{ b: <b /> }} />
        </div>
        <div className="shop-prompt-amount" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <input type="number" min={1} max={maxAmount || undefined} value={amount} onChange={(e) => setAmount(Math.max(1, Math.min(Number(e.target.value), maxAmount || Number.MAX_SAFE_INTEGER)))} className="shop-prompt-amount-input" />
          {maxAmount ? <span className="shop-prompt-amount-max">{t("profile.max", { max: maxAmount })}</span> : null}
        </div>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <button className="glass-button-green" onClick={() => onSubmit(amount)}>
            {t("profile.giveCredits")}
          </button>
          <button className="glass-button-red" onClick={onClose}>
            {t("profile.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  stock?: number; // optionnel, si le backend le fournit,
  iconHash: string;
}

// Define the InventoryHandle interface for the ref
interface InventoryHandle {
  reload: () => void;
}

interface CreatedGame {
  gameId: string;
  name: string;
  description?: string;
  price?: number;
  owner_id?: string;
  showInStore?: number;
  iconHash?: string;
  splashHash?: string | null;
  bannerHash?: string | null;
  genre?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  platforms?: string;
  rating?: number;
  website?: string;
  trailer_link?: string;
  multiplayer?: number;
  download_link?: string;
}

interface User {
  verified: boolean;
  id: string;
  username: string;
  disabled?: boolean;
  admin?: boolean;
  isStudio?: boolean;
  inventory?: ({
    itemId: string;
    name: string;
    description: string;
    price: number;
    iconHash: string;
    rarity: "very-common" | "common" | "uncommon" | "rare" | "very-rare" | "epic" | "ultra-epic" | "legendary" | "ancient" | "mythic" | "godlike" | "radiant";
    custom_url_link?: string;
  } & { amount: number })[];
  ownedItems?: ShopItem[];
  badges: ("staff" | "moderator" | "community_manager" | "early_user" | "bug_hunter" | "contributor" | "partner")[];
  createdGames?: CreatedGame[];
}

type ProfileProps = {
  userId: string; // userId
};

// ProfileShop: Shop section for a user's profile
// --- Style constants for ProfileShop ---
const inventoryGridStyle = (columns: number): React.CSSProperties => ({
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
});
const inventoryItemStyle: React.CSSProperties = {
  cursor: "pointer",
};
const tooltipStyle = (x: number, y: number): React.CSSProperties => ({
  left: x,
  top: y,
  position: "fixed",
  zIndex: 1000,
});

function ProfileShop({ user, onBuySuccess }: { user: User; onBuySuccess: () => void }) {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: ShopItem } | null>(null);
  const [prompt, setPrompt] = useState<{ message: string; resolve: (value: { confirmed: boolean; amount?: number }) => void; maxAmount?: number; amount?: number; item?: ShopItem } | null>(null);
  const [promptOwnerUser, setPromptOwnerUser] = useState<any | null>(null);
  const [alert, setAlert] = useState<{ message: string } | null>(null);
  const [shopModalOpen, setShopModalOpen] = useState(false);

  useEffect(() => {
    setItems(user.ownedItems || []);
    setLoading(false);
  }, [user.ownedItems]);
  // Tooltip handlers
  const handleMouseEnter = (e: React.MouseEvent, item: ShopItem) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    // Calculate tooltip position to avoid out-of-bounds
    const tooltipWidth = 320; // Approximate width of tooltip (px)
    const tooltipHeight = 120; // Approximate height of tooltip (px)
    const padding = 8;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let x = rect.right + padding;
    let y = rect.top;
    // Adjust X if tooltip would overflow right
    if (x + tooltipWidth > windowWidth) {
      x = rect.left - tooltipWidth - padding;
      if (x < 0) x = windowWidth - tooltipWidth - padding;
    }
    // Adjust Y if tooltip would overflow bottom
    if (y + tooltipHeight > windowHeight) {
      y = windowHeight - tooltipHeight - padding;
      if (y < 0) y = padding;
    }
    setTooltip({ x, y, item });
  };
  const handleMouseLeave = () => setTooltip(null);

  // Custom prompt for buying items
  const { getUser: getUserFromCache } = useUserCache();
  const customPrompt = async (message: string, maxAmount?: number, item?: ShopItem) => {
    let ownerUser: any = null;
    if (item && (item as any).owner) {
      try {
        ownerUser = await getUserFromCache((item as any).owner);
      } catch {}
    }
    setPrompt({ message, resolve: () => {}, maxAmount, amount: 1, item });
    setPromptOwnerUser(ownerUser);
    return new Promise<{ confirmed: boolean; amount?: number }>((resolve) => {
      setPrompt({ message, resolve, maxAmount, amount: 1, item });
      setPromptOwnerUser(ownerUser);
    });
  };

  // Handle prompt result
  const handlePromptResult = (confirmed: boolean) => {
    if (prompt) {
      const { amount } = prompt;
      prompt.resolve({ confirmed, amount });
      setPrompt(null);
      setPromptOwnerUser(null);
    }
  };

  // Handle amount change in prompt
  const handlePromptAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(Number(e.target.value), prompt?.maxAmount || Number.MAX_SAFE_INTEGER));
    setPrompt((prev) => (prev ? { ...prev, amount: value } : null));
  };

  // Buy logic
  const handleBuy = async (item: ShopItem) => {
    const maxAmount = item.stock ?? undefined;
    const result = await customPrompt(`Buy how many "${item.name}"?\nPrice: ${item.price} each${maxAmount ? `\nStock: ${maxAmount}` : ""}`, maxAmount, item);
    if (result.confirmed && result.amount && result.amount > 0) {
      fetch(endpoint + "/items/buy/" + item.itemId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: result.amount }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to buy item");
          return data;
        })
        .then(() => {
          // Refresh items
          fetch(endpoint + "/items", {
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => setItems(data.filter((item: any) => item.owner === user.id)))
            .finally(() => setLoading(false));
          onBuySuccess();
        })
        .catch((err) => {
          setAlert({ message: err.message });
        });
    }
  };

  // Grid layout calculations
  const columns = 4;
  const minRows = 8;
  const totalItems = items.length;
  const rows = Math.max(minRows, Math.ceil(totalItems / columns));
  const totalCells = rows * columns;
  const emptyCells = totalCells - totalItems;

  if (loading) return <p>{t("profile.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{t("profile.error")}</p>;
  if (items.length === 0) return <p>{t("profile.noItems")}</p>;

  return (
    <div className="profile-shop-section">
      <h2 className="profile-shop-title">{t("profile.shop")}</h2>
      <div className="inventory-grid" style={inventoryGridStyle(columns)}>
        {items.map((item) => (
          <div key={item.itemId} className="inventory-item" tabIndex={0} draggable={false} onMouseEnter={(e) => handleMouseEnter(e, item)} onMouseLeave={handleMouseLeave} onClick={() => handleBuy(item)} style={inventoryItemStyle}>
            <ShopItemImage item={item} />
          </div>
        ))}
        {Array.from({ length: emptyCells }).map((_, idx) => (
          <div key={`empty-${idx}`} className="inventory-item-empty" draggable={false} />
        ))}
      </div>
      {/* Tooltip overlay */}
      {tooltip && (
        <div className="shop-tooltip" style={tooltipStyle(tooltip.x, tooltip.y)}>
          <div className="shop-tooltip-name">{tooltip.item.name}</div>
          <div className="shop-tooltip-desc">{tooltip.item.description}</div>
          <div className="shop-tooltip-price" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {t("profile.price")} {tooltip.item.price}
            <CachedImage src="/assets/credit.avif" className="shop-credit-icon" />
            {tooltip.item.stock !== undefined && <span className="shop-tooltip-stock">{t("profile.shopTooltipStock", { stock: tooltip.item.stock })}</span>}
          </div>
        </div>
      )}
      {/* Buy prompt overlay */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt shop-prompt-buy" style={{ minWidth: 340, maxWidth: 420, background: "#23272a", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.18)", padding: 24, display: "flex", flexDirection: "column", gap: 14, color: "#fff" }}>
            {prompt.item && (
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <CachedImage src={`/items-icons/${prompt.item.iconHash || prompt.item.itemId}`} alt={prompt.item.name} style={{ width: 44, height: 44, borderRadius: 8, background: "#181a1a" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 17 }}>{prompt.item.name}</div>
                  <div style={{ color: "#aaa", fontSize: 13 }}>{prompt.item.description}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                    {t("profile.price")} {prompt.item.price}
                    <CachedImage src="/assets/credit.avif" style={{ width: 16, height: 16 }} />
                    {prompt.item.stock !== undefined && (
                      <span style={{ color: "#888", fontSize: 12 }}>
                        {t("profile.stockLabel")}: {prompt.item.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div style={{ fontSize: 15 }}>{prompt.message}</div>
            {prompt.maxAmount !== 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={1} max={prompt.maxAmount || undefined} value={prompt.amount} onChange={handlePromptAmountChange} style={{ width: 54, padding: "3px 7px", borderRadius: 4, border: "1px solid #36393f", background: "#181a1a", color: "#fff" }} />
                {prompt.maxAmount && <span style={{ color: "#888", fontSize: 12 }}>/ {prompt.maxAmount}</span>}
                {prompt.item && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                    {t("profile.totalLabel")} {(prompt.amount || 1) * (prompt.item.price || 0)}
                    <CachedImage src="/assets/credit.avif" style={{ width: 15, height: 15 }} />
                  </span>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button className="glass-button-green" onClick={() => handlePromptResult(true)}>
                {t("profile.buy")}
              </button>
              <button className="glass-button-red" onClick={() => handlePromptResult(false)}>
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div className="shop-alert-message">{alert.message}</div>
            <button className="glass-button" onClick={() => setAlert(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sous-composant pour préchargement/flou progressif des images d'item du shop
const ShopItemImage = React.memo(function ShopItemImage({ item }: { item: ShopItem }) {
  const iconUrl = "/items-icons/" + (item?.iconHash || item.itemId);
  return (
    <div style={{ position: "relative", width: "48px", height: "48px", background: "#181a1a", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CachedImage src={iconUrl} alt="default" className="inventory-item-img inventory-item-img-blur" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "6px", background: "#181a1a", display: "block" }} draggable={false} />
    </div>
  );
});

function useProfileLogic(userId: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Give credits modal state
  const [giveCreditsOpen, setGiveCreditsOpen] = useState(false);
  const [giveCreditsLoading, setGiveCreditsLoading] = useState(false);
  const [giveCreditsError, setGiveCreditsError] = useState<string | null>(null);
  const [giveCreditsSuccess, setGiveCreditsSuccess] = useState<string | null>(null);

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null);
  const [inventoryReloadFlag, setInventoryReloadFlag] = useState(0);
  const [isProfileReloading, setIsProfileReloading] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [createdGamesModalOpen, setCreatedGamesModalOpen] = useState(false);

  const reloadInventory = () => setInventoryReloadFlag((f) => f + 1);

  const searchParams = useSearchParams();
  const search = searchParams.get("user"); // Use directly, don't store in state

  const { user, token } = useAuth();
  const router = useRouter();
  const { getUser: getUserFromCache } = useUserCache();

  // Helper to reload profile (debounced to avoid too many fetches)
  const reloadProfile = useCallback(
    (reloadCache: boolean = false) => {
      setLoading(true);
      setIsProfileReloading(true);
      const selectedUserId = search || "@me";
      if (selectedUserId === "@me" || selectedUserId === user?.id) {
        setProfile(user);
        setLoading(false);
        return;
      }
      getUserFromCache(selectedUserId, !reloadCache, user?.admin)
        .then(setProfile)
        .catch((e) => {
          setError(e.message);
          if ((search || "@me") == "@me" && !token) {
            router.push("/login");
            return;
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [token, user?.admin, search, router]
  );

  // Debounce reloadProfile to avoid too many fetches
  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250); // 250ms debounce
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  // Désactiver le compte (admin)
  const handleDisableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/disable/${profile.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to disable account");
      reloadProfile(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Réactiver le compte (admin)
  const handleReenableAccount = async () => {
    if (!user?.admin || !token || !profile) return;
    try {
      const res = await fetch(`/api/users/admin/enable/${profile.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to re-enable account");
      reloadProfile(true);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      // Reload the profile picture
      // setProfile((prev) =>
      //   prev ? { ...prev, avatar: `${prev.avatar}?t=${Date.now()}` } : null
      // );
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  // Start or resume trade with the profile owner
  const handleStartTrade = async () => {
    const res = await fetch(`/api/trades/start-or-latest/${profile.id}`, {
      method: "POST",
    });
    const data = await res.json();
    setCurrentTradeId(data.id);
  };

  // Handler for giving credits
  const handleGiveCredits = async (amount: number) => {
    setGiveCreditsLoading(true);
    setGiveCreditsError(null);
    setGiveCreditsSuccess(null);
    try {
      const res = await fetch("/api/users/transfer-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: profile.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to transfer credits");
      setGiveCreditsSuccess("Credits sent!");
      setInventoryReloadFlag((f) => f + 1); // Optionally reload inventory
    } catch (e) {
      setGiveCreditsError(e.message);
    } finally {
      setGiveCreditsLoading(false);
    }
  };

  return {
    showTradeModal,
    setShowTradeModal,
    search,
    profile,
    loading,
    error,
    giveCreditsOpen,
    giveCreditsLoading,
    giveCreditsError,
    giveCreditsSuccess,
    currentTradeId,
    inventoryReloadFlag,
    isProfileReloading,
    setGiveCreditsOpen,
    setCurrentTradeId,
    reloadInventory,
    handleDisableAccount,
    handleReenableAccount,
    handleProfilePictureChange,
    handleStartTrade,
    handleGiveCredits,
    setLoading,
    reloadProfile,
    setProfile,
    setError,
    setGiveCreditsSuccess,
    setGiveCreditsError,
    setGiveCreditsLoading,
    setIsProfileReloading,
    setInventoryReloadFlag,
    shopModalOpen,
    setShopModalOpen,
    createdGamesModalOpen,
    setCreatedGamesModalOpen,
  };
}

// Version Desktop
function ProfileDesktop(props: ReturnType<typeof useProfileLogic>) {
  const { profile, loading, error, giveCreditsOpen, giveCreditsLoading, giveCreditsError, giveCreditsSuccess, currentTradeId, inventoryReloadFlag, isProfileReloading, setGiveCreditsOpen, setCurrentTradeId, reloadInventory, handleDisableAccount, handleReenableAccount, handleProfilePictureChange, handleStartTrade, handleGiveCredits, search, setIsProfileReloading, reloadProfile, setGiveCreditsError, setGiveCreditsSuccess, setInventoryReloadFlag, setLoading, setShowTradeModal } = props;

  const { user, token } = useAuth();
  const { t } = useTranslation("common");

  // Debounce reloadProfile to avoid too many fetches
  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250); // 250ms debounce
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  if (loading)
    return (
      <div className="container">
        <p>{t("profile.loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p style={{ color: "red" }}>{t("profile.error")}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="container">
        <p>{t("profile.notFound")}</p>
      </div>
    );

  // Only show give credits if not our own profile
  const isMe = !search || search === user?.id;
  const hasShopItems = profile.ownedItems && profile.ownedItems.length > 0;

  return (
    <div className="profile-root">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="profile-picture-container">
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "64px" }}>
            <label htmlFor="profile-picture-input" style={{ cursor: isMe ? "pointer" : "default", margin: 0 }}>
              <CachedImage src={"/avatar/" + (search || user?.id)} alt={profile.username} className="profile-avatar" />
              {isMe && <input id="profile-picture-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePictureChange} />}
            </label>
            <div className="profile-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="profile-name" style={{ display: "flex", alignItems: "center" }}>
                  {profile.username} <Certification user={profile} style={{ marginLeft: 4, width: 32, height: 32, position: "relative", top: 0, verticalAlign: "middle" }} />
                  {profile.disabled ? <span style={{ color: "red", marginLeft: 8 }}>{t("profile.disabledLabel")}</span> : null}
                </div>
                <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
              </div>
            </div>
          </div>
        </div>
        {user && (
          <>
            {!isMe ? (
              <div style={{ display: "inline-flex", gap: 8, marginTop: 8 }}>
                {user.admin && profile.disabled ? (
                  <button className="glass-button" style={{ background: "#4c7aafff" }} onClick={handleReenableAccount}>
                    {t("profile.reenable")}
                  </button>
                ) : null}
                {user.admin && !profile.disabled ? (
                  <button className="glass-button" style={{ background: "#f44336" }} onClick={handleDisableAccount}>
                    {t("profile.disable")}
                  </button>
                ) : null}
                {!profile.disabled ? (
                  <>
                    <button
                      className="glass-button"
                      onClick={() => {
                        setGiveCreditsOpen(true);
                        setGiveCreditsError(null);
                        setGiveCreditsSuccess(null);
                      }}
                    >
                      {t("profile.giveCredits")}
                    </button>
                    <button className="glass-button" onClick={handleStartTrade}>
                      {t("profile.trade")}
                    </button>
                    {hasShopItems ? (
                      <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
                        {t("profile.shop")}
                      </button>
                    ) : null}
                    {profile.createdGames && profile.createdGames.length > 0 ? (
                      <button className="glass-button" onClick={() => props.setCreatedGamesModalOpen(true)} style={{ minWidth: 90 }}>
                        {t("profile.createdGamesTitle", "Games ")}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <Link href="/my-market-listings">
                  <button className="glass-button">{t("profile.myMarketListings")}</button>
                </Link>
                {/* <Link href="/settings" title={t("profile.settings")}>
                  <button className="glass-button" style={{ padding: 0, background: "none", border: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 24, color: "#888" }}>
                      <i className="fa fa-cog" aria-hidden="true"></i>
                    </span>
                  </button>
                </Link> */}
                {hasShopItems ? (
                  <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
                    {t("profile.shop")}
                  </button>
                ) : null}
                {profile.createdGames && profile.createdGames.length > 0 ? (
                  <button className="glass-button" onClick={() => props.setCreatedGamesModalOpen(true)} style={{ minWidth: 90 }}>
                    {t("profile.createdGamesTitle", "Games ")}
                  </button>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 0 }}>
        <div style={{ flex: "0 0 100%" }}>
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t("profile.inventoryTitle")}</h2>
            <Inventory profile={{ ...profile, inventory: profile.inventory ? profile.inventory.map((item) => ({ ...item, item_id: item.itemId, icon_hash: item.iconHash })) : [] }} isMe={isMe} reloadFlag={inventoryReloadFlag} />
          </div>
        </div>
      </div>
      {/* Trade Panel - only show if not our own profile */}
      {user && user.id !== profile.id && currentTradeId && (
        <TradePanel
          tradeId={currentTradeId}
          userId={user.id}
          token={token}
          inventory={user.inventory}
          reloadInventory={reloadInventory}
          onClose={() => {
            setCurrentTradeId(null);
            setShowTradeModal(false);
          }}
          profile={profile}
          apiBase="/api"
        />
      )}
      {/* Give Credits Modal */}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={(amount) => {
          setGiveCreditsOpen(false);
          handleGiveCredits(amount);
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {/* Feedback for give credits */}
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div>{t("profile.sendingCredits")}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "red" }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div>{t("profile.creditsSent")}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
      {/* {hasShopItems && (
  <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
          {t("profile.shop")}
        </button>
      )} */}
      <ProfileShopModal open={props.shopModalOpen} onClose={() => props.setShopModalOpen(false)} user={profile} onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)} />
      <CreatedGamesModal
        open={props.createdGamesModalOpen}
        onClose={() => props.setCreatedGamesModalOpen(false)}
        games={profile.createdGames || []}
      />
    </div>
  );
}

// Version Mobile
function ProfileMobile(props: ReturnType<typeof useProfileLogic>) {
  const { profile, loading, error, giveCreditsOpen, giveCreditsLoading, giveCreditsError, giveCreditsSuccess, currentTradeId, inventoryReloadFlag, isProfileReloading, setGiveCreditsOpen, setCurrentTradeId, reloadInventory, handleDisableAccount, handleReenableAccount, handleProfilePictureChange, handleStartTrade, handleGiveCredits, search, setIsProfileReloading, reloadProfile, setGiveCreditsError, setShowTradeModal, setInventoryReloadFlag, setGiveCreditsSuccess } = props;

  const { user, token } = useAuth();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (isProfileReloading) return;
    const handler = setTimeout(() => {
      reloadProfile();
      setIsProfileReloading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [search, isProfileReloading, reloadProfile]);

  if (loading)
    return (
      <div className="container">
        <p>{t("profile.loading")}</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  if (!profile)
    return (
      <div className="container">
        <p>{t("profile.notFound")}</p>
      </div>
    );

  const isMe = !search || search === user?.id;
  const hasShopItems = profile.ownedItems && profile.ownedItems.length > 0;

  return (
    <div className="profile-root">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div className="profile-picture-container">
          <label htmlFor="profile-picture-input" style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: isMe ? "pointer" : "default" }}>
            <CachedImage src={"/avatar/" + (search || user?.id)} alt={profile.username} className="profile-avatar" />
          </label>
          {isMe && <input id="profile-picture-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePictureChange} />}
        </div>
        <div className="profile-header" style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="profile-name" style={{ fontSize: "1.2em", fontWeight: 600 }}>
            {profile.username} <Certification user={profile} style={{ marginLeft: 4, width: 24, height: 24, position: "relative", top: -2, verticalAlign: "middle" }} />
            {profile.disabled ? <span style={{ color: "red" }}>{t("profile.disabledLabel")}</span> : null}
          </div>
          <BadgesBox badges={profile.badges || []} studio={profile.isStudio} />
          <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8, marginBottom: 8 }}>
            {user && !isMe ? (
              <>
                {user.admin && profile.disabled ? (
                  <button className="glass-button" style={{ background: "#4c7aafff", minWidth: 90 }} onClick={handleReenableAccount}>
                    {t("profile.reenable")}
                  </button>
                ) : null}
                {user.admin && !profile.disabled ? (
                  <button className="glass-button" style={{ background: "#f44336", minWidth: 90 }} onClick={handleDisableAccount}>
                    {t("profile.disable")}
                  </button>
                ) : null}
                {!profile.disabled ? (
                  <>
                    <button
                      className="glass-button"
                      style={{ minWidth: 90 }}
                      onClick={() => {
                        setGiveCreditsOpen(true);
                        setGiveCreditsError(null);
                        setGiveCreditsSuccess(null);
                      }}
                    >
                      {t("profile.giveCredits")}
                    </button>
                    <button className="glass-button" style={{ minWidth: 90 }} onClick={handleStartTrade}>
                      {t("profile.trade")}
                    </button>
                    {hasShopItems ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setShopModalOpen(true)}>
                        {t("profile.shop")}
                      </button>
                    ) : null}
                    {profile.createdGames && profile.createdGames.length > 0 ? (
                      <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setCreatedGamesModalOpen(true)}>
                        {t("profile.createdGamesTitle", "Games ")}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
            {user && isMe ? (
              <>
                <Link href="/my-market-listings">
                  <button className="glass-button" style={{ minWidth: 90 }}>
                    {t("profile.myListings")}
                  </button>
                </Link>
                {/* <Link href="/settings" title={t("profile.settings")}>
                  <button className="glass-button" style={{ minWidth: 90, padding: 0, background: "none", border: "none" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 24, color: "#888" }}>
                      <i className="fa fa-cog" aria-hidden="true"></i>
                    </span>
                  </button>
                </Link> */}
                {hasShopItems ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setShopModalOpen(true)}>
                    {t("profile.shop")}
                  </button>
                ) : null}
                {profile.createdGames && profile.createdGames.length > 0 ? (
                  <button className="glass-button" style={{ minWidth: 90 }} onClick={() => props.setCreatedGamesModalOpen(true)}>
                    {t("profile.createdGamesTitle", "Games ")}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "0 8px" }}>
          <div className="profile-shop-section">
            <h2 className="profile-inventory-title">{t("profile.inventoryTitle")}</h2>
            <Inventory profile={{ ...profile, inventory: profile.inventory ? profile.inventory.map((item) => ({ ...item, item_id: item.itemId, icon_hash: item.iconHash })) : [] }} isMe={isMe} reloadFlag={inventoryReloadFlag} />
          </div>
        </div>
      </div>
      {/* Trade Panel - only show if not our own profile */}
      {user && user.id !== profile.id && currentTradeId && (
        <div className="trade-panel-centered">
          <TradePanel
            tradeId={currentTradeId}
            userId={user.id}
            token={token}
            inventory={user.inventory}
            reloadInventory={reloadInventory}
            onClose={() => {
              setCurrentTradeId(null);
              setShowTradeModal(false);
            }}
            profile={profile}
            apiBase="/api"
          />
        </div>
      )}
      {/* Give Credits Modal */}
      <GiveCreditsModal
        open={giveCreditsOpen}
        onClose={() => setGiveCreditsOpen(false)}
        onSubmit={(amount) => {
          setGiveCreditsOpen(false);
          handleGiveCredits(amount);
        }}
        maxAmount={user?.balance}
        username={profile.username || profile.username}
      />
      {/* Feedback for give credits */}
      {giveCreditsLoading && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div>{t("profile.sendingCredits")}</div>
          </div>
        </div>
      )}
      {giveCreditsError && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "red" }}>{giveCreditsError}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsError(null)}>
              OK
            </button>
          </div>
        </div>
      )}
      {giveCreditsSuccess && (
        <div className="shop-alert-overlay">
          <div className="shop-alert" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
            <div>{t("profile.creditsSent")}</div>
            <button className="shop-alert-ok-btn" onClick={() => setGiveCreditsSuccess(null)}>
              {t("profile.ok")}
            </button>
          </div>
        </div>
      )}
      {/* {hasShopItems && (
  <button className="glass-button" onClick={() => props.setShopModalOpen(true)} style={{ minWidth: 90 }}>
          {t("profile.shop")}
        </button>
      )} */}
      <ProfileShopModal open={props.shopModalOpen} onClose={() => props.setShopModalOpen(false)} user={profile} onBuySuccess={() => setInventoryReloadFlag((f) => f + 1)} />
      <CreatedGamesModal
        open={props.createdGamesModalOpen}
        onClose={() => props.setCreatedGamesModalOpen(false)}
        games={profile.createdGames || []}
      />
    </div>
  );
}

// --- Created Games Modal ---
function CreatedGamesModal({ open, onClose, games }) {
  const { t } = useTranslation("common");
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt" style={{ minWidth: 400, maxWidth: 600 }}>
        <button style={{ float: "right" }} onClick={onClose}>✕</button>
        <h2 style={{ marginTop: 0 }}>{t("profile.createdGamesTitle", "Games ")}</h2>
        {games.length === 0 ? (
          <div>{t("profile.noCreatedGames", "Aucun jeu créé")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {games.map((game) => (
              <div key={game.gameId} style={{ border: "1px solid #36393f", borderRadius: 8, padding: 12, background: "#23272a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CachedImage src={`/games-icons/${game.iconHash ? game.iconHash : "default"}`} style={{ width: 48, height: 48, borderRadius: 8 }} />
                  <div onClick={() => window.open(`/game?gameId=${game.gameId}`, "_blank")} style={{ cursor: "pointer", flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{game.name}</div>
                    <div style={{ color: "#aaa", fontSize: 13 }}>{game.description?.slice(0, 120) || ""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Utilitaire pour badge
const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  staff: { label: "Staff", icon: "fa-screwdriver-wrench", color: "#7289DA" },
  moderator: { label: "Moderator", icon: "fa-shield-halved", color: "#f2ad58ff" },
  community_manager: { label: "Community Manager", icon: "fa-users", color: "#23a548ff" },
  early_user: { label: "Early User", icon: "fa-bolt", color: "#ff3535ff" },
  bug_hunter: { label: "Bug Hunter", icon: "fa-bug", color: "#fff200ff" },
  contributor: { label: "Contributor", icon: "fa-code-branch", color: "#7200b8ff" },
  partner: { label: "Partner", icon: "fa-handshake", color: "#677BC4" },
  support: { label: "Support", icon: "fa-headset", color: "#e51ed8ff" },
};

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserShield, faShieldHalved, faUsers, faBolt, faBug, faCodeBranch, faHandshake, faHeadset, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

const BADGE_ICONS = {
  "fa-user-shield": faUserShield,
  "fa-shield-halved": faShieldHalved,
  "fa-screwdriver-wrench": faScrewdriverWrench,
  "fa-users": faUsers,
  "fa-bolt": faBolt,
  "fa-bug": faBug,
  "fa-code-branch": faCodeBranch,
  "fa-handshake": faHandshake,
  "fa-headset": faHeadset,
};

function BadgesBox({ badges, studio }: { badges: string[]; studio?: boolean }) {
  const filteredBadges = badges.filter((badge) => {
    if (badge === "early_user" && studio) return false;
    return true;
  });
  if (!filteredBadges || filteredBadges.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, border: "1px solid #36393f", background: "rgba(54,57,63,0.85)", borderRadius: 8, padding: "6px 12px", marginTop: 8, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)" }}>
      {filteredBadges.map((badge) => {
        const info = BADGE_INFO[badge];
        if (!info) return null;
        const icon = BADGE_ICONS[info.icon];
        return (
          <Link key={badge} href={`/badges#${badge}`} passHref legacyBehavior>
            <a title={info.label} style={{ display: "flex", alignItems: "center", borderRadius: 6, padding: "2px 10px 2px 10px", fontWeight: 500, fontSize: 15, transition: "transform 0.1s", textDecoration: "none", cursor: "pointer", outline: "none" }} tabIndex={0}>
              <FontAwesomeIcon icon={icon} style={{ fontSize: 20, filter: "drop-shadow(0 0px 0px rgba(0, 0, 0, 0))" }} color={info.color} fixedWidth />
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export default function Profile({ userId }: ProfileProps) {
  const isMobile = useIsMobile();
  const logic = useProfileLogic(userId);
  return isMobile ? <ProfileMobile {...logic} /> : <ProfileDesktop {...logic} />;
}
