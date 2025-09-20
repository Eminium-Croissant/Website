import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import CachedImage from "../components/utils/CachedImage";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export interface EnrichedMarketListing {
  id: string;
  seller_id: string;
  item_id: string;
  price: number;
  status: string;
  metadata?: { [key: string]: unknown; _unique_id?: string };
  created_at: string;
  updated_at: string;
  sold_at?: string;
  buyer_id?: string;
  purchasePrice?: number;
  item_name: string;
  item_description: string;
  item_icon_hash: string;
  sellerName?: string;
}

function useMarketplaceLogic() {
  const { user, loading: userLoading } = useAuth();
  const [listings, setListings] = useState<EnrichedMarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuyOrderModal, setShowBuyOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnrichedMarketListing | null>(null);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const { getUser: getUserFromCache } = useUserCache();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market-listings?limit=100`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const uniqueSellerIds = Array.from(new Set(listings.map((l) => l.seller_id)));
    const missing = uniqueSellerIds.filter((id) => !(id in sellerNames));
    if (missing.length === 0) return;
    Promise.all(missing.map((id) => getUserFromCache(id).catch(() => null))).then((users) => {
      const newNames: Record<string, string> = {};
      users.forEach((user, idx) => {
        if (user && user.username) newNames[missing[idx]] = user.username;
      });
      setSellerNames((prev) => ({ ...prev, ...newNames }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  const handleBuy = async (listing: EnrichedMarketListing) => {
    if (!user) return alert("You must be logged in to buy.");
    if (!confirm(`Buy "${listing.item_name}" for ${listing.price} credits?`)) return;
    try {
      const res = await fetch(`/api/market-listings/${listing.id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Purchase failed");
      alert("Purchase successful!");
      setListings((listings) => listings.filter((l) => l.id !== listing.id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Buy order modal logic
  const [buyOrderItemId, setBuyOrderItemId] = useState("");
  const [buyOrderPrice, setBuyOrderPrice] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [buyOrderItemSearch, setBuyOrderItemSearch] = useState("");
  const [buyOrderItemResults, setBuyOrderItemResults] = useState<any[]>([]);
  const [buyOrderDropdownOpen, setBuyOrderDropdownOpen] = useState(false);

  const handlePlaceBuyOrder = async () => {
    if (!user) return alert("You must be logged in.");
    if (!buyOrderItemId || buyOrderPrice <= 0) return alert("All fields are required.");
    setPlacingOrder(true);
    try {
      const res = await fetch("/api/buy-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: buyOrderItemId,
          price: buyOrderPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place buy order");
      alert("Buy order placed!");
      setShowBuyOrderModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleItemSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setBuyOrderItemResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const items = await res.json();
      setBuyOrderItemResults(items);
    } catch {
      setBuyOrderItemResults([]);
    }
  };

  return {
    user,
    listings,
    loading,
    error,
    showBuyOrderModal,
    setShowBuyOrderModal,
    sellerNames,
    handleBuy,
    buyOrderItemId,
    setBuyOrderItemId,
    buyOrderPrice,
    setBuyOrderPrice,
    placingOrder,
    buyOrderItemSearch,
    setBuyOrderItemSearch,
    buyOrderItemResults,
    setBuyOrderItemResults,
    buyOrderDropdownOpen,
    setBuyOrderDropdownOpen,
    handlePlaceBuyOrder,
    handleItemSearch,
  };
}

function MarketplaceDesktop(props: ReturnType<typeof useMarketplaceLogic>) {
  const { user, listings, loading, error, showBuyOrderModal, setShowBuyOrderModal, sellerNames, handleBuy, buyOrderItemId, setBuyOrderItemId, buyOrderPrice, setBuyOrderPrice, placingOrder, buyOrderItemSearch, setBuyOrderItemSearch, buyOrderItemResults, buyOrderDropdownOpen, setBuyOrderDropdownOpen, handlePlaceBuyOrder, handleItemSearch } = props;

  const { t } = useTranslation("common");

  return (
    <div className="glass-page-container">
      <div className="glass-content-card max-w-[1100px] mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{t("marketplace.title")}</h2>
          <div className="flex gap-3">
            <button className="bg-[#2a2a32] text-white border border-[#444] rounded-lg px-5 py-2 font-semibold text-sm hover:bg-[#32323a] transition-colors" onClick={() => setShowBuyOrderModal(true)}>
              {t("marketplace.placeBuyOrder")}
            </button>
            {user && (
              <Link href="/my-buy-orders">
                <button className="bg-[#23272e] text-white border border-[#444] rounded-lg px-5 py-2 font-semibold text-sm hover:bg-[#32323a] transition-colors">{t("marketplace.myBuyOrders")}</button>
              </Link>
            )}
          </div>
        </div>

        {loading && <div className="text-gray-400">{t("marketplace.loading")}</div>}

        {error && <div className="text-red-500">{t("marketplace.error")}</div>}

        {!loading && listings.length === 0 ? (
          <div className="text-gray-400">{t("marketplace.noItems")}</div>
        ) : (
          <div className="market-table-wrapper overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 bg-[#23272e] rounded-xl overflow-hidden shadow-lg mt-4">
              <thead>
                <tr>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333] text-left">{t("marketplace.item")}</th>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333]">{t("marketplace.description")}</th>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333]">{t("marketplace.seller")}</th>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333]">{t("marketplace.price")}</th>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333]">{t("marketplace.listed")}</th>
                  <th className="bg-[#1c1c24] text-white font-semibold text-sm p-3 border-b border-[#333]"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#2c313a] transition-colors">
                    <td className="p-3 text-white border-b border-[#292c33]">
                      <div className="flex items-center gap-2 relative">
                        <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt="" className="w-8 h-8 rounded-lg bg-[#1c1c24]" />
                        {listing.metadata?._unique_id && (
                          <span
                            className="absolute top-0.5 left-6 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-black z-10 cursor-pointer"
                            onMouseEnter={(e) => {
                              const tooltip = document.createElement("div");
                              tooltip.innerText =
                                Object.entries(listing.metadata)
                                  .filter(([key]) => key !== "_unique_id")
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ") || "Metadata";
                              tooltip.className = "fixed bg-[#23272e] text-[#ffd700] px-3 py-1.5 rounded-lg text-xs z-50 marketplace-metadata-tooltip";
                              tooltip.style.left = e.clientX + 12 + "px";
                              tooltip.style.top = e.clientY + "px";
                              document.body.appendChild(tooltip);
                              const removeTooltip = () => {
                                document.body.querySelectorAll(".marketplace-metadata-tooltip").forEach((t) => t.remove());
                                e.target.removeEventListener("mouseleave", removeTooltip);
                              };
                              e.target.addEventListener("mouseleave", removeTooltip);
                            }}
                          />
                        )}
                        {listing.item_name}
                      </div>
                    </td>
                    <td className="p-3 text-gray-300 border-b border-[#292c33] max-w-[260px]">{listing.item_description}</td>
                    <td className="p-3 text-white border-b border-[#292c33]">
                      <div className="flex items-center gap-2">
                        <CachedImage src={`/avatar/${listing.seller_id}`} alt="" className="w-6 h-6 rounded-full" />
                        {sellerNames[listing.seller_id] || listing.seller_id}
                      </div>
                    </td>
                    <td className="p-3 text-white border-b border-[#292c33]">
                      {listing.price}
                      <CachedImage src="/assets/credit.avif" alt="credits" className="w-3.5 inline-block ml-1 align-middle" />
                    </td>
                    <td className="p-3 text-white border-b border-[#292c33]">{typeof window === "undefined" ? new Date(listing.created_at).toISOString().slice(0, 16).replace("T", " ") : new Date(listing.created_at).toLocaleString()}</td>{" "}
                    <td className="p-3 text-white border-b border-[#292c33]">
                      {user && listing.seller_id !== user.id ? (
                        <button className="bg-[#2a2a32] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#32323a] transition-colors" onClick={() => handleBuy(listing)}>
                          {t("marketplace.buy")}
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Buy Order Modal */}
        {showBuyOrderModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#23272e] rounded-xl p-8 min-w-[340px] shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6">{t("marketplace.modalTitle")}</h3>
              <div className="mb-4 relative">
                <label className="text-white">
                  {t("marketplace.item")}&nbsp;
                  <input
                    type="text"
                    value={buyOrderItemSearch}
                    onChange={async (e) => {
                      setBuyOrderItemSearch(e.target.value);
                      setBuyOrderDropdownOpen(true);
                      await handleItemSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (buyOrderItemSearch.length > 1) setBuyOrderDropdownOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setBuyOrderDropdownOpen(false), 150)}
                    placeholder={t("marketplace.searchItem")}
                    className="w-[180px] bg-[#1c1c24] border border-[#444] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#1e90ff]"
                  />
                  {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                    <ul className="absolute left-0 right-0 top-[36px] bg-[#23272e] border border-[#444] rounded-lg max-h-[200px] overflow-y-auto z-50">
                      {buyOrderItemResults.map((item) => (
                        <li
                          key={item.itemId}
                          className="flex items-center gap-2 p-3 cursor-pointer border-b border-[#333] hover:bg-[#2c313a] transition-colors"
                          onMouseDown={() => {
                            setBuyOrderItemId(item.itemId);
                            setBuyOrderItemSearch(item.name);
                            setBuyOrderPrice(item.price || 1);
                            setBuyOrderDropdownOpen(false);
                          }}
                        >
                          <CachedImage src={`/items-icons/${item.iconHash || item.itemId}`} alt="icon" className="w-6 h-6 rounded bg-[#1c1c24]" />
                          <span className="text-white">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>
              <div className="mb-6">
                <label className="text-white">
                  {t("marketplace.price")}&nbsp;
                  <input type="number" min={1} value={buyOrderPrice} onChange={(e) => setBuyOrderPrice(Number(e.target.value))} className="w-[100px] bg-[#1c1c24] border border-[#444] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#1e90ff]" />
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handlePlaceBuyOrder} disabled={placingOrder} className="flex-1 bg-[#2a2a32] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#32323a] transition-colors disabled:opacity-50">
                  {placingOrder ? t("marketplace.placing") : t("marketplace.confirm")}
                </button>
                <button onClick={() => setShowBuyOrderModal(false)} className="flex-1 bg-[#1c1c24] text-white border border-[#444] px-5 py-2 rounded-lg font-semibold hover:bg-[#32323a] transition-colors">
                  {t("marketplace.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketplaceMobile(props: ReturnType<typeof useMarketplaceLogic>) {
  const { user, listings, loading, error, showBuyOrderModal, setShowBuyOrderModal, sellerNames, handleBuy, buyOrderItemId, setBuyOrderItemId, buyOrderPrice, setBuyOrderPrice, placingOrder, buyOrderItemSearch, setBuyOrderItemSearch, buyOrderItemResults, buyOrderDropdownOpen, setBuyOrderDropdownOpen, handlePlaceBuyOrder, handleItemSearch } = props;

  const { t } = useTranslation("common");

  return (
    <div className="glass-page-container">
      <div className="glass-content-card max-w-[480px] mx-auto p-2 text-[0.98em]">
        <div className="flex flex-col gap-2.5 mb-2.5">
          <h2 className="text-lg font-bold text-white">{t("marketplace.title")}</h2>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-[#2a2a32] text-white border border-[#444] rounded-lg px-3 py-1.5 font-semibold text-sm hover:bg-[#32323a] transition-colors" onClick={() => setShowBuyOrderModal(true)}>
              {t("marketplace.placeBuyOrder")}
            </button>
            {user && (
              <Link href="/my-buy-orders">
                <button className="bg-[#23272e] text-white border border-[#444] rounded-lg px-3 py-1.5 font-semibold text-sm hover:bg-[#32323a] transition-colors">{t("marketplace.myBuyOrders")}</button>
              </Link>
            )}
          </div>
        </div>

        {loading && <div className="text-gray-400">{t("marketplace.loading")}</div>}
        {error && <div className="text-red-500">{t("marketplace.error")}</div>}

        {!loading && listings.length === 0 ? (
          <div className="text-gray-400">{t("marketplace.noItems")}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-[#23272e] rounded-xl shadow-lg p-3 flex flex-col gap-1.5 relative">
                <div className="flex items-center gap-2.5 relative">
                  <CachedImage src={`/items-icons/${listing.item_icon_hash || listing.item_id}`} alt="" className="w-9 h-9 rounded-lg bg-[#1c1c24]" />
                  {listing.metadata?._unique_id && (
                    <div
                      className="absolute top-1 left-8 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-black z-10"
                      onMouseEnter={(e) => {
                        const tooltip = document.createElement("div");
                        tooltip.innerText =
                          Object.entries(listing.metadata)
                            .filter(([key]) => key !== "_unique_id")
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ") || "Metadata";
                        tooltip.className = "fixed bg-[#23272e] text-[#ffd700] px-3 py-1.5 rounded-lg text-xs z-50 marketplace-metadata-tooltip";
                        tooltip.style.left = e.clientX + 12 + "px";
                        tooltip.style.top = e.clientY + "px";
                        document.body.appendChild(tooltip);
                        const removeTooltip = () => {
                          document.body.querySelectorAll(".marketplace-metadata-tooltip").forEach((t) => t.remove());
                          e.target.removeEventListener("mouseleave", removeTooltip);
                        };
                        e.target.addEventListener("mouseleave", removeTooltip);
                      }}
                    />
                  )}
                  <div>
                    <div className="font-semibold text-[1.05em] text-white">{listing.item_name}</div>
                    <div className="text-gray-400 text-[0.97em]">{listing.item_description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <CachedImage src={`/avatar/${listing.seller_id}`} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-white text-[0.97em]">{sellerNames[listing.seller_id] || listing.seller_id}</span>
                  <span className="ml-auto text-white font-semibold">
                    {listing.price}
                    <CachedImage src="/assets/credit.avif" alt="credits" className="w-3.5 inline-block ml-1 align-middle" />
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-gray-400 text-[0.93em]">Listed: {new Date(listing.created_at).toLocaleString()}</span>
                  <span className="ml-auto">
                    {user && listing.seller_id !== user.id ? (
                      <button className="bg-[#2a2a32] text-white px-3.5 py-1.5 rounded-lg text-[0.97em] font-semibold hover:bg-[#32323a] transition-colors" onClick={() => handleBuy(listing)}>
                        {t("marketplace.buy")}
                      </button>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Buy Order Modal */}
        {showBuyOrderModal && (
          <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
            <div className="bg-[#23272e] w-full max-w-[480px] rounded-t-xl p-4.5 shadow-lg animate-slideUp">
              <div className="w-10 h-1 bg-[#444] rounded mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white text-center mb-3.5">{t("marketplace.modalTitle")}</h3>

              <div className="mb-3 relative">
                <label className="font-medium text-white">
                  {t("marketplace.item")}
                  <input
                    type="text"
                    value={buyOrderItemSearch}
                    onChange={async (e) => {
                      setBuyOrderItemSearch(e.target.value);
                      setBuyOrderDropdownOpen(true);
                      await handleItemSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (buyOrderItemSearch.length > 1) setBuyOrderDropdownOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setBuyOrderDropdownOpen(false), 150)}
                    placeholder={t("marketplace.searchItem")}
                    className="w-full bg-[#1c1c24] border border-[#444] rounded-lg px-3 py-2 mt-1 text-white placeholder-gray-500 focus:outline-none focus:border-[#1e90ff]"
                  />
                  {buyOrderDropdownOpen && buyOrderItemResults.length > 0 && (
                    <ul className="absolute left-0 right-0 top-[70px] bg-[#23272e] border border-[#444] rounded-lg max-h-[140px] overflow-y-auto z-50">
                      {buyOrderItemResults.map((item) => (
                        <li
                          key={item.itemId}
                          className="flex items-center gap-2 p-2 cursor-pointer border-b border-[#333] hover:bg-[#2c313a] transition-colors"
                          onMouseDown={() => {
                            setBuyOrderItemId(item.itemId);
                            setBuyOrderItemSearch(item.name);
                            setBuyOrderPrice(item.price || 1);
                            setBuyOrderDropdownOpen(false);
                          }}
                        >
                          <CachedImage src={`/items-icons/${item.iconHash || item.itemId}`} alt="icon" className="w-6 h-6 rounded bg-[#1c1c24]" />
                          <span className="text-white">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </label>
              </div>

              <div className="mb-3.5">
                <label className="font-medium text-white">
                  {t("marketplace.price")}
                  <input type="number" min={1} value={buyOrderPrice} onChange={(e) => setBuyOrderPrice(Number(e.target.value))} className="w-full bg-[#1c1c24] border border-[#444] rounded-lg px-3 py-2 mt-1 text-white focus:outline-none focus:border-[#1e90ff]" />
                </label>
              </div>

              <div className="flex gap-2 mt-2">
                <button onClick={handlePlaceBuyOrder} disabled={placingOrder} className="flex-1 bg-[#2a2a32] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#32323a] transition-colors disabled:opacity-50">
                  {placingOrder ? t("marketplace.placing") : t("marketplace.confirm")}
                </button>
                <button onClick={() => setShowBuyOrderModal(false)} className="flex-1 bg-[#1c1c24] text-white border border-[#444] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#32323a] transition-colors">
                  {t("marketplace.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0.7;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.18s cubic-bezier(0.4, 1.4, 0.6, 1) 1;
          }
        `}</style>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const isMobile = useIsMobile();
  const logic = useMarketplaceLogic();
  return isMobile ? <MarketplaceMobile {...logic} /> : <MarketplaceDesktop {...logic} />;
}
