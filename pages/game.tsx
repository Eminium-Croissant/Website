import React, { JSX } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";
import useUserCache from "../hooks/useUserCache";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";
import Certification from "../components/common/Certification";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
const endpoint = "/api";

function useGamePageLogic() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const [game, setGame] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { token } = useAuth();
  const [prompt, setPrompt] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<string | JSX.Element | null>(null);
  const [buying, setBuying] = React.useState(false);
  const [isGifting, setIsGifting] = React.useState(false);
  const [giftMessage, setGiftMessage] = React.useState("");
  const [showGiftModal, setShowGiftModal] = React.useState(false);
  const [giftCode, setGiftCode] = React.useState<string | null>(null);
  const [userOwnsGame, setUserOwnsGame] = React.useState(false);

  const { getUser: getUserFromCache } = useUserCache();
  const [ownerInfo, setOwnerInfo] = React.useState<{
    id: string;
    username: string;
    verified?: boolean;
    admin?: boolean;
    isStudio?: boolean;
  } | null>(null);

  React.useEffect(() => {
    fetch(endpoint + "/games/" + gameId)
      .then((res) => res.json())
      .then(setGame)
      .finally(() => setLoading(false));
  }, [gameId]);

  React.useEffect(() => {
    if (game?.owner_id || game?.ownerId) {
      const ownerId = game.owner_id || game.ownerId;
      getUserFromCache(ownerId)
        .then(setOwnerInfo)
        .catch(() => setOwnerInfo(null));
    } else {
      setOwnerInfo(null);
    }
  }, [game, getUserFromCache]);

  React.useEffect(() => {
    if (token && game) {
      fetch(`${endpoint}/games/list/@me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((userGames) => {
          setUserOwnsGame(userGames.some((g) => g.gameId === game.gameId));
        })
        .catch(() => setUserOwnsGame(false));
    }
  }, [token, game]);

  const handleBuyGame = async () => {
    if (!game) return;
    setPrompt(`Buy "${game.name}"?\nPrice: ${game.price}`);
  };

  const { t } = useTranslation("common");
  const confirmBuy = async () => {
    setPrompt(null);
    setBuying(true);
    try {
      const res = await fetch(`${endpoint}/games/${game.gameId}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to buy game");
      setAlert(t("shop.purchaseSuccess"));
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setBuying(false);
    }
  };

  const handleGiftGame = async () => {
    if (!game || !token) return;
    setShowGiftModal(true);
  };

  const confirmGift = async () => {
    setShowGiftModal(false);
    setIsGifting(true);
    try {
      const res = await fetch(`${endpoint}/gifts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: game.gameId,
          message: giftMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create gift");

      setGiftCode(data.gift.giftCode);
      setGiftMessage("");
      setAlert(
        <>
          Gift created! Share this link:{" "}
          <a href={`/gift?code=${data.gift.giftCode}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50", textDecoration: "underline" }}>
            {typeof window !== "undefined" ? window.location.origin + `/gift?code=${data.gift.giftCode}` : `/gift?code=${data.gift.giftCode}`}
          </a>
        </>
      );
    } catch (err: any) {
      setAlert(err.message);
    } finally {
      setIsGifting(false);
    }
  };

  return {
    game,
    loading,
    router,
    ownerInfo,
    userOwnsGame,
    prompt,
    setPrompt,
    alert,
    setAlert,
    buying,
    handleBuyGame,
    confirmBuy,
    isGifting,
    handleGiftGame,
    confirmGift,
    showGiftModal,
    setShowGiftModal,
    giftMessage,
    setGiftMessage,
    token,
  };
}

function GameDesktop(props: ReturnType<typeof useGamePageLogic>) {
  const { game, loading, router, ownerInfo, userOwnsGame, prompt, setPrompt, alert, setAlert, buying, handleBuyGame, confirmBuy, isGifting, handleGiftGame, confirmGift, showGiftModal, setShowGiftModal, giftMessage, setGiftMessage, token } = props;

  const { t } = useTranslation("common");

  const skeleton = (
    <div className="main-details-steam gamepage-root gamepage-blur">
      <button className="gamepage-back-btn" style={{ opacity: 0 }}>
        ← Back
      </button>
      <div className="banner-container">
        <div className="main-banner-steam skeleton-banner" />
        <div className="main-icon-steam skeleton-icon" />
      </div>
      <div className="main-details-content">
        <div className="skeleton-title" />
        <div className="skeleton-desc" />
        <div className="skeleton-properties" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ position: "relative" }}>
        {skeleton}
        <div className="gamepage-loading-overlay">
          <div className="inventory-loading-spinner" />
        </div>
      </div>
    );
  }
  if (!game) return <div>Game not found.</div>;

  return (
    <div className="main-details-steam gamepage-root">
      <button onClick={() => router.back()} className="gamepage-back-btn">
        {t("shop.back")}
      </button>
      <div className="banner-container">
        <img src={`/banners-icons/${game.bannerHash}`} alt={game.name} className="main-banner-steam" />
        <img src={`/games-icons/${game.iconHash}`} alt={game.name} className="main-icon-steam" />
      </div>
      <div className="main-details-content">
        <h2>{game.name}</h2>
        {ownerInfo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <a
              href={`/profile?user=${ownerInfo.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <CachedImage
                src={`/avatar/${ownerInfo.id}`}
                alt={ownerInfo.username}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  marginRight: 8,
                  objectFit: "cover",
                  border: "2px solid #444",
                }}
              />
              <span style={{ fontWeight: 500 }}>
                {ownerInfo.username}
                <Certification
                  user={{ ...ownerInfo, verified: ownerInfo.verified ?? false }}
                  style={{
                    marginLeft: 6,
                    width: 16,
                    height: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    verticalAlign: "middle",
                  }}
                />
              </span>
            </a>
          </div>
        )}
        {game.price !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "16px 0",
            }}
          >
            <div>
              <b>{t("shop.price")}</b> {game.price} <CachedImage src="/assets/credit.avif" className="gamepage-credit-icon" />
            </div>
            {!userOwnsGame ? (
              <button
                className="shop-game-buy-btn"
                style={{
                  padding: "10px 32px",
                  fontSize: 16,
                  borderRadius: 8,
                  fontWeight: 700,
                  background: "#4caf50",
                  color: "var(--text-color-primary)",
                  border: "none",
                  cursor: buying ? "not-allowed" : "pointer",
                  opacity: buying ? 0.7 : 1,
                }}
                onClick={handleBuyGame}
                disabled={buying}
              >
                {t("shop.buy")}
              </button>
            ) : null}
            {token && (
              <button
                className="shop-game-gift-btn"
                style={{
                  padding: "10px 32px",
                  fontSize: 16,
                  borderRadius: 8,
                  fontWeight: 700,
                  background: "#ff9800",
                  color: "var(--text-color-primary)",
                  border: "none",
                  cursor: isGifting ? "not-allowed" : "pointer",
                  opacity: isGifting ? 0.7 : 1,
                }}
                onClick={handleGiftGame}
                disabled={isGifting}
              >
                {t("shop.giftWithPrice", { price: game.price })}
              </button>
            )}
          </div>
        )}
        <p className="gamepage-desc" style={{ overflowY: "auto" }}>
          {game.description.split("\n").map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
        <div className="game-properties">
          {game.genre && (
            <div>
              <b>{t("shop.genre")}</b> {game.genre}
            </div>
          )}
          {game.developer && (
            <div>
              <b>Developer:</b> {game.developer}
            </div>
          )}
          {game.publisher && (
            <div>
              <b>Publisher:</b> {game.publisher}
            </div>
          )}
          {game.release_date && (
            <div>
              <b>Release Date:</b> {game.release_date}
            </div>
          )}
          {game.platforms && (
            <div>
              <b>Platforms:</b> {game.platforms}
            </div>
          )}
        </div>
      </div>
      {/* Gift Modal */}
      {showGiftModal && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">
              <h3>
                {t("shop.gift")} "{game.name}"
              </h3>
              <textarea
                placeholder={t("shop.giftMessagePlaceholder")}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                style={{
                  width: "100%",
                  height: "80px",
                  margin: "10px 0",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
              />
            </div>
            <button className="shop-prompt-buy-btn" onClick={confirmGift} disabled={isGifting}>
              {t("shop.createGift")}
            </button>
            <button
              className="shop-prompt-cancel-btn"
              onClick={() => {
                setShowGiftModal(false);
                setGiftMessage("");
              }}
              disabled={isGifting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Prompt overlay - Seulement pour les achats */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">{prompt}</div>
            <button className="shop-prompt-buy-btn" onClick={confirmBuy} disabled={buying}>
              {t("shop.buy")}
            </button>
            <button className="shop-prompt-cancel-btn" onClick={() => setPrompt(null)} disabled={buying}>
              {t("shop.cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Alert overlay */}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div className="shop-alert-message">{alert}</div>
            <button className="shop-alert-ok-btn" onClick={() => setAlert(null)}>
              {t("shop.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GameMobile(props: ReturnType<typeof useGamePageLogic>) {
  const { game, loading, router, ownerInfo, userOwnsGame, prompt, setPrompt, alert, setAlert, buying, handleBuyGame, confirmBuy, isGifting, handleGiftGame, confirmGift, showGiftModal, setShowGiftModal, giftMessage, setGiftMessage, token } = props;

  const { t } = useTranslation("common");

  const skeleton = (
    <div className="main-details-steam gamepage-root gamepage-blur" style={{ fontSize: "0.98em" }}>
      <button className="gamepage-back-btn" style={{ opacity: 0 }}>
        ← Back
      </button>
      <div className="banner-container">
        <div className="main-banner-steam skeleton-banner" />
        <div className="main-icon-steam skeleton-icon" />
      </div>
      <div className="main-details-content">
        <div className="skeleton-title" />
        <div className="skeleton-desc" />
        <div className="skeleton-properties" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ position: "relative" }}>
        {skeleton}
        <div className="gamepage-loading-overlay">
          <div className="inventory-loading-spinner" />
        </div>
      </div>
    );
  }
  if (!game) return <div>Game not found.</div>;

  return (
    <div className="main-details-steam gamepage-root" style={{ fontSize: "0.98em", padding: 0 }}>
      <button onClick={() => router.back()} className="gamepage-back-btn" style={{ fontSize: "1em", padding: "6px 18px" }}>
        ← Back
      </button>
      <div className="banner-container" style={{ height: 120 }}>
        <img src={`/banners-icons/${game.bannerHash}`} alt={game.name} className="main-banner-steam" style={{ height: 120, objectFit: "cover" }} />
        <img src={`/games-icons/${game.iconHash}`} alt={game.name} className="main-icon-steam" style={{ width: 64, height: 64, left: 12, bottom: -32 }} />
      </div>
      <div className="main-details-content" style={{ padding: "24px 10px 10px 10px" }}>
        <h2 style={{ fontSize: "1.1em" }}>{game.name}</h2>
        {ownerInfo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <a
              href={`/profile?user=${ownerInfo.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <CachedImage
                src={`/avatar/${ownerInfo.id}`}
                alt={ownerInfo.username}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  marginRight: 8,
                  objectFit: "cover",
                  border: "2px solid #444",
                }}
              />
              <span style={{ fontWeight: 500, fontSize: "0.98em" }}>
                {ownerInfo.username}
                <Certification
                  user={{ ...ownerInfo, verified: ownerInfo.verified ?? false }}
                  style={{
                    marginLeft: 6,
                    width: 16,
                    height: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    verticalAlign: "middle",
                  }}
                />
              </span>
            </a>
          </div>
        )}
        {game.price !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "12px 0",
              flexWrap: "wrap",
            }}
          >
            <div>
              <b>{t("shop.price")}</b> {game.price} <CachedImage src="/assets/credit.avif" className="gamepage-credit-icon" style={{ width: 18, height: 18 }} />
            </div>
            {!userOwnsGame ? (
              <button
                className="shop-game-buy-btn"
                style={{
                  padding: "8px 18px",
                  fontSize: "1em",
                  borderRadius: 7,
                  fontWeight: 700,
                  background: "#4caf50",
                  color: "var(--text-color-primary)",
                  border: "none",
                  cursor: buying ? "not-allowed" : "pointer",
                  opacity: buying ? 0.7 : 1,
                }}
                onClick={handleBuyGame}
                disabled={buying}
              >
                {t("shop.buy")}
              </button>
            ) : null}
            {token && (
              <button
                className="shop-game-gift-btn"
                style={{
                  padding: "8px 18px",
                  fontSize: "1em",
                  borderRadius: 7,
                  fontWeight: 700,
                  background: "#ff9800",
                  color: "var(--text-color-primary)",
                  border: "none",
                  cursor: isGifting ? "not-allowed" : "pointer",
                  opacity: isGifting ? 0.7 : 1,
                }}
                onClick={handleGiftGame}
                disabled={isGifting}
              >
                {t("shop.giftWithPrice", { price: game.price })}
              </button>
            )}
          </div>
        )}
        <p className="gamepage-desc" style={{ overflowY: "auto", fontSize: "0.98em" }}>
          {game.description.split("\n").map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
        <div className="game-properties" style={{ fontSize: "0.97em" }}>
          {game.genre && (
            <div>
              <b>{t("shop.genre")}</b> {game.genre}
            </div>
          )}
          {game.developer && (
            <div>
              <b>Developer:</b> {game.developer}
            </div>
          )}
          {game.publisher && (
            <div>
              <b>Publisher:</b> {game.publisher}
            </div>
          )}
          {game.release_date && (
            <div>
              <b>Release Date:</b> {game.release_date}
            </div>
          )}
          {game.platforms && (
            <div>
              <b>Platforms:</b> {game.platforms}
            </div>
          )}
        </div>
      </div>
      {/* Gift Modal */}
      {showGiftModal && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">
              <h3 style={{ fontSize: "1em" }}>
                {t("shop.gift")} "{game.name}"
              </h3>
              <textarea
                placeholder={t("shop.giftMessagePlaceholder")}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                style={{
                  width: "100%",
                  height: "60px",
                  margin: "8px 0",
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  fontSize: "0.98em",
                }}
              />
            </div>
            <button className="shop-prompt-buy-btn" onClick={confirmGift} disabled={isGifting} style={{ fontSize: "1em", padding: "7px 18px" }}>
              {t("shop.createGift")}
            </button>
            <button
              className="shop-prompt-cancel-btn"
              onClick={() => {
                setShowGiftModal(false);
                setGiftMessage("");
              }}
              disabled={isGifting}
              style={{ fontSize: "1em", padding: "7px 18px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Prompt overlay */}
      {prompt && (
        <div className="shop-prompt-overlay">
          <div className="shop-prompt">
            <div className="shop-prompt-message">{prompt}</div>
            <button className="shop-prompt-buy-btn" onClick={confirmBuy} disabled={buying} style={{ fontSize: "1em", padding: "7px 18px" }}>
              {t("shop.buy")}
            </button>
            <button className="shop-prompt-cancel-btn" onClick={() => setPrompt(null)} disabled={buying} style={{ fontSize: "1em", padding: "7px 18px" }}>
              {t("shop.cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Alert overlay */}
      {alert && (
        <div className="shop-alert-overlay">
          <div className="shop-alert">
            <div className="shop-alert-message">{alert}</div>
            <button className="shop-alert-ok-btn" onClick={() => setAlert(null)} style={{ fontSize: "1em", padding: "7px 18px" }}>
              {t("shop.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamePage() {
  const isMobile = useIsMobile();
  const logic = useGamePageLogic();
  return isMobile ? <GameMobile {...logic} /> : <GameDesktop {...logic} />;
}
