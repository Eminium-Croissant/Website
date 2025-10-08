// TradePanel.tsx
import React, { useEffect, useState, useRef } from "react";
import type { Item } from "./Inventory";
import CachedImage from "./utils/CachedImage";

type TradeStatus = "pending" | "approved" | "completed" | "canceled";
interface TradeItem extends Item {
  item_id: string;
  amount: number;
  metadata?: { [key: string]: unknown; _unique_id?: string };
  purchasePrice?: number;
}
interface Trade {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserItems: TradeItem[];
  toUserItems: TradeItem[];
  approvedFromUser: boolean;
  approvedToUser: boolean;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}
interface TradePanelProps {
  tradeId: string;
  userId: string;
  token: string;
  inventory: Item[];
  reloadInventory: () => void;
  onClose: () => void;
  profile?: { username: string };
  apiBase?: string;
}

// Fonction pour formater les métadonnées pour l'affichage
const formatMetadata = (metadata?: { [key: string]: unknown }) =>
  metadata
    ? Object.entries(metadata)
      .filter(([k]) => k !== "_unique_id")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || null
    : null;

// Sous-composant pour un item d'inventaire
// Normalize incoming item objects to expected TradeItem shape
const normalizeTradeItem = (raw: any): TradeItem => ({
  ...raw,
  item_id: raw.item_id ?? raw.itemId ?? (raw.itemId ? String(raw.itemId) : ""),
  amount: raw.amount ?? raw.count ?? 0,
  name: raw.name ?? raw.itemName ?? raw.label ?? "",
  description: raw.description ?? raw.desc ?? "",
  iconHash: raw.iconHash ?? raw.icon_hash ?? raw.icon ?? "",
  metadata: raw.metadata ?? raw.meta ?? raw.data ?? undefined,
  purchasePrice: raw.purchasePrice ?? raw.purchase_price ?? raw.price ?? undefined,
});

// Sous-composant pour un item d'inventaire
function TradeInventoryItem({ item: rawItem, onClick }: { item: TradeItem; onClick?: () => void }) {
  const item = normalizeTradeItem(rawItem);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const formattedMetadata = formatMetadata(item.metadata);
  const iconId = item.iconHash || item.item_id || "";

  return (
    <div
      className="trade-inventory-item"
      onClick={onClick}
      onMouseEnter={e => {
        setShowTooltip(true);
        setMousePos({ x: e.clientX, y: e.clientY });
      }}
      onMouseMove={e => showTooltip && setMousePos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => {
        setShowTooltip(false);
        setMousePos(null);
      }}
      title={onClick ? `Add ${item.name} to the trade` : undefined}
      style={{ position: "relative" }}
    >
      <CachedImage src={"/items-icons/" + iconId} alt={item.name} />
      <div className="trade-item-qty" style={{ position: "absolute", zIndex: 3, right: 6, top: 42, background: "rgba(0,0,0,0.65)", color: "#fff", padding: "2px 6px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, lineHeight: "1", pointerEvents: "none" }}>
        x{item.amount}
      </div>
      <div className="trade-item-name">{item.name}</div>
      {item.metadata && <div style={{ position: "absolute", top: "2px", right: "2px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ffd700", zIndex: 3, border: "1px solid #000" }} />}
      {showTooltip && mousePos && (
        <div className="trade-tooltip" style={{ position: "fixed", left: mousePos.x + 12 - 290, top: mousePos.y + 12 - 48, backgroundColor: "#333", color: "white", padding: "8px", borderRadius: "4px", fontSize: "12px", zIndex: 1000, maxWidth: "200px", wordWrap: "break-word" }}>
          <div style={{ fontWeight: "bold" }}>{item.name}</div>
          <div style={{ fontSize: "11px", color: "#ccc" }}>{item.description}</div>
          {formattedMetadata && <div style={{ color: "#888", fontSize: "10px", marginTop: "4px", fontStyle: "italic" }}>{formattedMetadata}</div>}
          {item.metadata?._unique_id && <div style={{ color: "#666", fontSize: "9px", marginTop: "2px", fontFamily: "monospace" }}>ID: {(item.metadata._unique_id as string).substring(0, 8)}...</div>}
        </div>
      )}
    </div>
  );
}

// Sous-composant pour une colonne d'items de trade
function TradeColumn({ title, items, approved, removable, onRemoveItem }: { title: string; items: TradeItem[]; approved: boolean; removable?: boolean; onRemoveItem?: (item: TradeItem) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h3>{title}</h3>
      <div className={"trade-column" + (approved ? " trade-approved" : "")}>
        <div className="trade-inventory-grid">
          {items.map(item => (
            <TradeInventoryItem
              key={item.metadata?._unique_id ? `${item.item_id}-${item.metadata._unique_id}` : item.item_id}
              item={item}
              onClick={removable && onRemoveItem ? () => onRemoveItem({ ...item, amount: 1, metadata: item.metadata }) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TradePanel({ tradeId, userId, token, inventory, reloadInventory, onClose, profile, apiBase = "/api" }: TradePanelProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll trade state every second
  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const res = await fetch(`${apiBase}/trades/${tradeId}`);
        if (!res.ok) throw new Error("Failed to fetch trade");
        setTrade(await res.json());
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
    intervalRef.current = setInterval(fetchTrade, 1000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [tradeId, token, apiBase]);

  // Close panel if trade is completed
  useEffect(() => {
    if (trade?.status === "completed" || trade?.status === "canceled") onClose();
  }, [trade?.status, onClose]);

  // Actions
  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/approve`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to approve trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/cancel`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to cancel trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  async function addItem(item: { item_id: string; amount: number; metadata?: { [key: string]: unknown; _unique_id?: string }; purchasePrice?: number }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/add-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeItem: { itemId: item.item_id, amount: item.amount, metadata: item.metadata, purchasePrice: item.purchasePrice } }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const removeItem = async (item: TradeItem) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/remove-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeItem: { itemId: item.item_id, amount: item.amount, metadata: item.metadata, purchasePrice: item.purchasePrice } }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const isCurrentUserFrom = trade?.fromUserId === userId;
  const rawUserItems = isCurrentUserFrom ? trade?.fromUserItems || [] : trade?.toUserItems || [];
  const rawOtherItems = isCurrentUserFrom ? trade?.toUserItems || [] : trade?.fromUserItems || [];
  const userItems: TradeItem[] = (rawUserItems || []).map(normalizeTradeItem);
  const otherItems: TradeItem[] = (rawOtherItems || []).map(normalizeTradeItem);
  const userApproved = isCurrentUserFrom ? trade?.approvedFromUser : trade?.approvedToUser;
  const otherApproved = isCurrentUserFrom ? trade?.approvedToUser : trade?.approvedFromUser;

  // UI
  if (loading && !trade) return <div>Loading trade...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!trade) return <div>Trade not found.</div>;

  return (
    <div className="trade-panel trade-panel-centered">
      <div className="trade-close-x" onClick={onClose} title="Fermer" style={{ position: "absolute", top: 18, right: 22, fontSize: "2rem", color: "#aaa", cursor: "pointer", zIndex: 10, userSelect: "none" }}>×</div>
      <h2>Trade with {profile?.username}</h2>
      <div className="trade-main-columns" style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <TradeColumn title="Your items in the trade" items={userItems} approved={!!userApproved} removable={true} onRemoveItem={removeItem} />
        </div>
        <div style={{ flex: 1 }}>
          <TradeColumn title="Other user's items" items={otherItems} approved={!!otherApproved} />
        </div>
      </div>
      <div className="trade-inventory-section">
        <h3>Your inventory</h3>
        <div className="trade-inventory-grid" style={{ justifyContent: "flex-start" }}>
          {inventory
            .map(normalizeTradeItem)
            .map(item => {
              const totalOwned = Number(item.amount || 0);
              if (item.metadata?._unique_id) {
                const inTradeCount = userItems.filter(ti => ti.item_id === item.item_id && ti.metadata?._unique_id === item.metadata?._unique_id).reduce((sum, ti) => sum + (ti.amount || 0), 0);
                return { ...item, available: Math.max(0, totalOwned - inTradeCount) };
              } else {
                const priceKey = item.purchasePrice ?? null;
                const inTrade = userItems.filter(ti => !ti.metadata?._unique_id && ti.item_id === item.item_id && (ti.purchasePrice ?? null) === priceKey).reduce((sum, ti) => sum + (ti.amount || 0), 0);
                return { ...item, available: Math.max(0, totalOwned - inTrade) };
              }
            })
            .filter(item => item.available > 0)
            .map(item => (
              <TradeInventoryItem
                key={item.metadata?._unique_id ? `${item.item_id}-${item.metadata._unique_id}` : `${item.item_id}-${item.purchasePrice ?? "no-price"}`}
                item={{ ...item, amount: item.available, metadata: item.metadata }}
                onClick={() => addItem({ item_id: item.item_id, amount: 1, metadata: item.metadata, purchasePrice: item.purchasePrice })}
              />
            ))}
        </div>
      </div>
      <div className="trade-actions">
        <button onClick={approve} disabled={trade.status !== "pending"} className="glass-button-green" style={{ minWidth: 88 }}>Approve</button>
        <button onClick={cancel} disabled={trade.status !== "pending"} className="glass-button-red" style={{ minWidth: 88 }}>Cancel</button>
      </div>
      <div className="trade-status">
        <span>{userApproved ? "You have approved" : "You have not approved yet"}</span>
      </div>
    </div>
  );
}
