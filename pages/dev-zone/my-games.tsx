import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import useIsMobile from "../../hooks/useIsMobile";
import Certification from "../../components/common/Certification";

const endpoint = "/api"; // Replace with your actual API endpoint

type Game = {
  gameId: string;
  name: string;
  description: string;
  price: number;
  showInStore: boolean;
  iconHash?: string;
  bannerHash?: string;
  genre?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  platforms?: string;
  website?: string;
  trailer_link?: string;
  multiplayer?: boolean;
  download_link?: string; // <-- Ajouté ici
};

const MyGames = () => {
  const isMobile = useIsMobile();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    game: Game;
  } | null>(null);

  const { token } = useAuth(); // Assuming useAuth is imported from your hooks
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(endpoint + "/games/@mine");
        if (res.ok) {
          const data = await res.json();
          setGames(Array.isArray(data) ? data : data.games || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleEdit = (game: Game) => {
    setEditingId(game.gameId);
    setFormData({
      name: game.name,
      description: game.description,
      price: game.price.toString(),
      showInStore: game.showInStore,
      iconHash: game.iconHash || null,
      bannerHash: game.bannerHash || null,
      genre: game.genre || "",
      release_date: game.release_date || "",
      developer: game.developer || "",
      publisher: game.publisher || "",
      platforms: game.platforms || "",
      website: game.website || "",
      trailer_link: game.trailer_link || "",
      multiplayer: !!game.multiplayer,
      download_link: game.download_link || "", // <-- Ajouté ici
    });
    setIconFile(null);
    setBannerFile(null);
    setErrors({});
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
    setIconFile(null);
    setBannerFile(null);
    setErrors({});
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    let iconHash = formData.iconHash;
    let bannerHash = formData.bannerHash;

    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/game-icon", {
          method: "POST",
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload icon." });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload icon." });
        setSubmitting(false);
        return;
      }
    }

    if (bannerFile) {
      const bannerData = new FormData();
      bannerData.append("banner", bannerFile);
      try {
        const res = await fetch("/upload/banner", {
          method: "POST",
          body: bannerData,
        });
        if (res.ok) {
          const data = await res.json();
          bannerHash = data.hash;
        } else {
          const err = await res.json();
          setErrors({ submit: err.error || "Failed to upload banner." });
          setSubmitting(false);
          return;
        }
      } catch (err: any) {
        setErrors({ submit: err.message || "Failed to upload banner." });
        setSubmitting(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: formData.showInStore,
      iconHash,
      bannerHash,
      genre: formData.genre,
      release_date: formData.release_date,
      developer: formData.developer,
      publisher: formData.publisher,
      platforms: formData.platforms,
      website: formData.website,
      trailer_link: formData.trailer_link,
      multiplayer: formData.multiplayer,
      download_link: formData.download_link, // <-- Ajouté ici
    };

    try {
      const res = await fetch(endpoint + `/games/${editingId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess("Game updated successfully!");
        setGames((games) => games.map((game) => (game.gameId === editingId ? { ...game, ...data } : game)));
        setEditingId(null);
        setFormData(null);
        setIconFile(null);
        setBannerFile(null);
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || "Failed to update game." });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to update game." });
    } finally {
      setSubmitting(false);
    }
  };

  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [ownershipGame, setOwnershipGame] = useState<Game | null>(null);
  const [ownershipUserId, setOwnershipUserId] = useState("");
  const [ownershipUserSearch, setOwnershipUserSearch] = useState("");
  const [ownershipUserResults, setOwnershipUserResults] = useState<any[]>([]);
  const [ownershipUserDropdownOpen, setOwnershipUserDropdownOpen] = useState(false);
  const [ownershipError, setOwnershipError] = useState<string | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const ownershipUserInputRef = React.useRef<HTMLInputElement>(null);

  // User search for ownership transfer
  const handleOwnershipUserSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setOwnershipUserResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const users = await res.json();
      setOwnershipUserResults(users);
    } catch (e) {
      setOwnershipUserResults([]);
    }
  };

  // Handle ownership transfer button click
  const handleOwnershipTransfer = (game: Game) => {
    setOwnershipGame(game);
    setShowOwnershipModal(true);
    setOwnershipUserId("");
    setOwnershipUserSearch("");
    setOwnershipUserResults([]);
    setOwnershipError(null);
  };

  // Confirm ownership transfer
  const handleConfirmOwnershipTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipGame || !ownershipUserId) {
      setOwnershipError("Veuillez sélectionner un utilisateur.");
      return;
    }
    setOwnershipLoading(true);
    setOwnershipError(null);
    try {
      const res = await fetch(`/api/games/transfer-ownership/${ownershipGame.gameId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newOwnerId: ownershipUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setOwnershipError(data.message || "Erreur lors du transfert d'ownership");
      } else {
        setShowOwnershipModal(false);
        setOwnershipGame(null);
        setOwnershipUserId("");
        setOwnershipUserSearch("");
        setOwnershipUserResults([]);
        setOwnershipError(null);
        // Optionally refresh games
        setGames((prev) => prev);
      }
    } catch (err) {
      setOwnershipError("Erreur lors du transfert d'ownership");
    } finally {
      setOwnershipLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div
        style={{
          maxWidth: 340,
          margin: "40px auto",
          padding: "24px 12px",
          background: "#23272e",
          borderRadius: 12,
          color: "#fff",
          textAlign: "center",
          fontSize: "1.08em",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Not available on mobile</h2>
        <p>
          This page is only accessible from a computer.
          <br />
          Please use a PC to manage your games.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mygames-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h1 className="mygames-title">
            <span className="mygames-title-span">My Games</span>
          </h1>
          <Link
            href="/dev-zone/create-game"
            className="mygames-add-btn"
            style={{
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              padding: "10px 18px",
              fontSize: "1rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            + Add Game
          </Link>
        </div>
        {loading ? (
          <div className="mygames-loading">Loading...</div>
        ) : (
          <>
            {games.length === 0 && <div className="mygames-empty">No games found.</div>}
            <div className="mygames-grid">
              {games.map((game) => (
                <div
                  key={`game-${game.gameId}`}
                  className="mygames-card"
                  tabIndex={0}
                  draggable={false}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.right + 8,
                      y: rect.top,
                      game,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleEdit(game)}
                >
                  <img src={"/games-icons/" + game.iconHash} alt={game.name} className="mygames-card-icon" draggable={false} />
                  <div className="mygames-card-name">{game.name}</div>
                  <div className="mygames-card-price">
                    {game.price}
                    <img src="/assets/credit.avif" className="mygames-card-credit" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <button
                      className="mygames-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(game);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="mygames-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(game.gameId);
                        // Optional: Add visual feedback
                        e.currentTarget.textContent = "Copied!";
                        setTimeout(() => {
                          e.currentTarget.textContent = "Id";
                        }, 1000);
                      }}
                    >
                      Id
                    </button>
                    <button
                      className="mygames-card-editbtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOwnershipTransfer(game);
                      }}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({
                length: Math.max(0, 6 * Math.ceil(games.length / 6) - games.length),
              }).map((_, idx) => (
                <div key={`empty-${idx}`} className="mygames-card-empty" />
              ))}
            </div>
            {tooltip && (
              <div
                className="mygames-tooltip"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                }}
              >
                <div className="mygames-tooltip-title">{tooltip.game.name}</div>
                <div className="mygames-tooltip-desc">{tooltip.game.description}</div>
                <div className="mygames-tooltip-price">
                  Price: {tooltip.game.price}
                  <img src="/assets/credit.avif" className="mygames-card-credit" />
                  <span className="mygames-tooltip-store">Show in Store: {tooltip.game.showInStore ? "Yes" : "No"}</span>
                </div>
              </div>
            )}
            {editingId && (
              <div className="mygames-modal-overlay">
                <form onSubmit={handleSubmit} className="mygames-modal-form">
                  <div className="mygames-modal-col">
                    <h2 className="mygames-modal-title">Edit Game</h2>
                    <label className="mygames-label" htmlFor="name">
                      Name
                    </label>
                    <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="mygames-input" required />
                    <label className="mygames-label" htmlFor="description">
                      Description
                    </label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows={2} className="mygames-input" required />
                    <label className="mygames-label" htmlFor="price">
                      Price
                    </label>
                    <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" min={0} className="mygames-input" required />
                    <label className="mygames-label">
                      <input type="checkbox" name="showInStore" checked={formData.showInStore} onChange={handleChange} className="mygames-checkbox" />
                      Show in Store
                    </label>
                    <label className="mygames-label">
                      <input type="checkbox" name="multiplayer" checked={formData.multiplayer} onChange={handleChange} className="mygames-checkbox" />
                      Multiplayer
                    </label>
                  </div>
                  <div className="mygames-modal-col">
                    <label className="mygames-label" htmlFor="icon">
                      Game Icon
                    </label>
                    <input id="icon" type="file" accept="image/*" onChange={handleIconChange} className="mygames-input" />
                    <label className="mygames-label" htmlFor="banner">
                      Banner
                    </label>
                    <input id="banner" type="file" accept="image/*" onChange={handleBannerChange} className="mygames-input" />
                    <label className="mygames-label" htmlFor="genre">
                      Genre
                    </label>
                    <input id="genre" type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="Genre" className="mygames-input" />
                    <label className="mygames-label" htmlFor="release_date">
                      Release Date
                    </label>
                    <input id="release_date" type="date" name="release_date" value={formData.release_date} onChange={handleChange} placeholder="Release Date" className="mygames-input" />
                    <label className="mygames-label" htmlFor="publisher">
                      Publisher
                    </label>
                    <input id="publisher" type="text" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher" className="mygames-input" />
                  </div>
                  <div className="mygames-modal-col">
                    <label className="mygames-label" htmlFor="developer">
                      Developer
                    </label>
                    <input id="developer" type="text" name="developer" value={formData.developer} onChange={handleChange} placeholder="Developer" className="mygames-input" />
                    <label className="mygames-label" htmlFor="platforms">
                      Platforms
                    </label>
                    <input id="platforms" type="text" name="platforms" value={formData.platforms} onChange={handleChange} placeholder="Platforms" className="mygames-input" />
                    <label className="mygames-label" htmlFor="website">
                      Website
                    </label>
                    <input id="website" type="url" name="website" value={formData.website} onChange={handleChange} placeholder="Website" className="mygames-input" />
                    <label className="mygames-label" htmlFor="trailer_link">
                      Trailer Link
                    </label>
                    <input id="trailer_link" type="url" name="trailer_link" value={formData.trailer_link} onChange={handleChange} placeholder="Trailer Link" className="mygames-input" />
                  </div>
                  <div className="mygames-modal-col">
                    <label className="mygames-label" htmlFor="download_link">
                      Download Link
                    </label>
                    <input id="download_link" type="url" name="download_link" value={formData.download_link} onChange={handleChange} placeholder="https://example.com/download" className="mygames-input" />
                  </div>
                  <div className="mygames-modal-actions">
                    {errors.submit && <div className="mygames-error">{errors.submit}</div>}
                    <div className="mygames-modal-btns">
                      <button type="submit" disabled={submitting} className="mygames-btn-save">
                        {submitting ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={handleCancel} disabled={submitting} className="mygames-btn-cancel">
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {showOwnershipModal && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.35)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowOwnershipModal(false)}
              >
                <div
                  className="modal-content"
                  style={{
                    background: "#232323",
                    borderRadius: 10,
                    padding: 32,
                    minWidth: 320,
                    position: "relative",
                    boxShadow: "0 2px 16px #0005",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="close-modal-btn"
                    onClick={() => setShowOwnershipModal(false)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 16,
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                  <h3 style={{ marginBottom: 18 }}>Transfer ownership</h3>
                  <form autoComplete="off" onSubmit={handleConfirmOwnershipTransfer}>
                    <div style={{ position: "relative", marginBottom: 12 }}>
                      <label style={{ color: "#fff", marginBottom: 4, display: "block" }}>Select user:</label>
                      <input
                        ref={ownershipUserInputRef}
                        type="text"
                        value={ownershipUserSearch}
                        onChange={async (e) => {
                          setOwnershipUserSearch(e.target.value);
                          setOwnershipUserDropdownOpen(true);
                          setOwnershipUserId("");
                          await handleOwnershipUserSearch(e.target.value);
                        }}
                        onFocus={() => {
                          if (ownershipUserSearch.length > 1) setOwnershipUserDropdownOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setOwnershipUserDropdownOpen(false), 150)}
                        placeholder="Search user by name..."
                        style={{
                          marginRight: 8,
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #444",
                          background: "#181818",
                          color: "#fff",
                          fontSize: "1rem",
                          width: "280px",
                        }}
                      />
                      {ownershipUserDropdownOpen && ownershipUserResults.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 40,
                            background: "#232323",
                            border: "1px solid #444",
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: "auto",
                            zIndex: 1001,
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          {ownershipUserResults.map((u) => (
                            <li
                              key={u.userId || u.user_id || u.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #333",
                              }}
                              onMouseDown={() => {
                                setOwnershipUserId(u.userId || u.user_id || u.id);
                                setOwnershipUserSearch(u.username);
                                setOwnershipUserDropdownOpen(false);
                              }}
                            >
                              <img src={`/avatar/${u.userId || u.user_id || u.id}`} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%" }} onError={(e) => (e.currentTarget.src = "/avatar/default.avif")} />
                              <span style={{ color: "#fff" }}>{u.username}</span>
                              <Certification
                                user={u}
                                style={{
                                  width: 16,
                                  height: 16,
                                  verticalAlign: "middle",
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        type="submit"
                        disabled={ownershipLoading || !ownershipUserId}
                        style={{
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 500,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: ownershipUserId ? "pointer" : "not-allowed",
                        }}
                      >
                        {ownershipLoading ? "Transferring..." : "Transfer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOwnershipModal(false)}
                        style={{
                          background: "#222",
                          border: "1px solid #444",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "10px 24px",
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {ownershipError && <div style={{ color: "red", marginTop: 12 }}>{ownershipError}</div>}
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyGames;
