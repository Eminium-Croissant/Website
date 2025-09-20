import Section from "../components/common/Section/Section";
import ListSection from "../components/common/Section/ListSection";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHandshake, faCode, faPalette, faFileText, faFlask, faRocket, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useGamesCache } from "../hooks/useApiCache";
import ImageCache from "../components/utils/ImageCache";

// Types pour les jeux du shop
interface Game {
  gameId: string;
  name: string;
  price: number;
  genre?: string;
  description?: string;
  bannerHash?: string;
  iconHash?: string;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function Home() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { t } = useTranslation("common");

  // Overview details content as an array for easier maintenance
  const overviewDetails = [
    {
      summary: t("index.overview.players.title"),
      content: (
        <ul className="list-disc pl-5 space-y-2 text-glass-text">
          <li className="text-glass-text-secondary">{t("index.overview.players.1")}</li>
          <li>{t("index.overview.players.2")}</li>
          <li>{t("index.overview.players.3")}</li>
          <li>{t("index.overview.players.4")}</li>
          <li>
            <span className="text-neon-green">NEW:</span> {t("index.overview.players.5")}
          </li>
        </ul>
      ),
    },
    {
      summary: t("index.overview.creators.title"),
      content: (
        <>
          <ul>
            <li>
              {(() => {
                const text = t("index.overview.creators.1");
                const parts = text.split("SDK or API");
                return (
                  <>
                    {parts[0]}
                    <Link href="/api-docs" className="text-neon-blue hover:text-neon-purple transition-colors">
                      SDK or API
                    </Link>
                    {parts[1]}
                  </>
                );
              })()}
            </li>
            <li>{t("index.overview.creators.2")}</li>
            <li>{t("index.overview.creators.3")}</li>
            <li>{t("index.overview.creators.4")}</li>
            <li>
              <span className="text-neon-green">NEW:</span> {t("index.overview.creators.5")}
            </li>
            <li>
              <span className="text-neon-green">NEW:</span> {t("index.overview.creators.6")}
            </li>
          </ul>
          <p className="text-glass-text-secondary mb-3">
            <span className="font-bold text-glass-text">{t("index.overview.creators.getstarted").split(":")[0]}:</span>
          </p>
          <p>
            {(() => {
              const getStarted = t("index.overview.creators.getstarted");
              const [label, rest] = getStarted.split(":");
              let content = rest || "";
              const parts = content.split(/(settings|documentation)/g);
              return (
                <>
                  {parts.map((part, idx) => {
                    if (part === "settings") {
                      return (
                        <Link href="/settings" legacyBehavior key={idx}>
                          <a className="text-neon-blue hover:text-neon-purple transition-colors">settings</a>
                        </Link>
                      );
                    }
                    if (part === "documentation") {
                      return (
                        <Link href="/api-docs" legacyBehavior key={idx}>
                          <a className="text-neon-blue hover:text-neon-purple transition-colors">documentation</a>
                        </Link>
                      );
                    }
                    return part;
                  })}
                </>
              );
            })()}
          </p>
        </>
      ),
    },
    {
      summary: t("index.overview.marketplace.title"),
      content: <ListSection title={t("index.overview.marketplace.title")} description={t("index.overview.marketplace.desc")} items={[t("index.overview.marketplace.1"), t("index.overview.marketplace.2"), t("index.overview.marketplace.3"), t("index.overview.marketplace.4")]} />,
    },
    {
      summary: t("index.overview.lobby.title"),
      content: <ListSection title={t("index.overview.lobby.title")} description={t("index.overview.lobby.desc")} items={[t("index.overview.lobby.1"), t("index.overview.lobby.2"), t("index.overview.lobby.3"), t("index.overview.lobby.4")]} />,
    },
    {
      summary: t("index.overview.safety.title"),
      content: (
        <Section title={t("index.overview.safety.title")}>
          <p>{t("index.overview.safety.1")}</p>
        </Section>
      ),
    },
    {
      summary: t("index.overview.oauth2.title"),
      content: (
        <>
          <p>
            {(() => {
              const oauthText = t("index.overview.oauth2.1");
              const [before, after] = oauthText.split("/oauth2/test");
              return (
                <>
                  {before}
                  <Link href="/oauth2/test" className="text-neon-blue hover:text-neon-purple transition-colors">
                    <b>/oauth2/test</b>
                  </Link>
                  {after}
                </>
              );
            })()}
            <br />
            {t("index.overview.oauth2.2")}
          </p>
          <ul>
            <li>{t("index.overview.oauth2.3")}</li>
            <li>{t("index.overview.oauth2.4")}</li>
            <li>{t("index.overview.oauth2.5")}</li>
          </ul>
          <p>
            <b>{t("index.overview.oauth2.try").split(":")[0]}:</b>{" "}
            <Link href="/oauth2/test" legacyBehavior>
              <a className="text-neon-blue hover:text-neon-purple transition-colors">/oauth2/test</a>
            </Link>
          </p>
        </>
      ),
    },
  ];

  // About details content as an array for easier maintenance
  const aboutDetails = [
    {
      summary: t("index.about.whoami.title"),
      content: <p>{t("index.about.whoami.1")}</p>,
    },
    {
      summary: t("index.about.system.title"),
      content: (
        <>
          <p>{t("index.about.system.1")}</p>
          <p>{t("index.about.system.2")}</p>
          <p>{t("index.about.system.3")}</p>
        </>
      ),
    },
    {
      summary: t("index.about.api.title"),
      content: (
        <p>
          {(() => {
            const apiText = t("index.about.api.1");
            const [before, after] = apiText.split("here");
            return (
              <>
                {before}
                <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923" className="text-neon-blue hover:text-neon-purple transition-colors">
                  <b>here</b>
                </a>
                {after}
              </>
            );
          })()}
        </p>
      ),
    },
    {
      summary: t("index.about.philosophy.title"),
      content: (
        <>
          <p>{t("index.about.philosophy.1")}</p>
          <p>{t("index.about.philosophy.2")}</p>
        </>
      ),
    },
    {
      summary: t("index.about.gamers.title"),
      content: <p>{t("index.about.gamers.1")}</p>,
    },
    {
      summary: t("index.about.creators.title"),
      content: <p>{t("index.about.creators.1")}</p>,
    },
    {
      summary: t("index.about.simplicity.title"),
      content: <p>{t("index.about.simplicity.1")}</p>,
    },
    {
      summary: t("index.about.future.title"),
      content: <p>{t("index.about.future.1")}</p>,
    },
    {
      summary: t("index.about.community.title"),
      content: <p>{t("index.about.community.1")}</p>,
    },
  ];

  // Composant Carrousel pour les jeux du shop
  function GameCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: apiGames, loading, error, fromCache } = useGamesCache();

    // Jeux de démonstration en cas d'erreur
    const demoGames: Game[] = [
      {
        gameId: "demo-1",
        name: "Jump Space",
        price: 19.5,
        genre: "Aventure Spatiale",
        description: "Explorez l'univers infini dans cette aventure spatiale épique. Combattez des ennemis, découvrez de nouveaux mondes et construisez votre empire galactique.",
        iconHash: "demo-icon-1",
        bannerHash: "demo-banner-1",
      },
      {
        gameId: "demo-2",
        name: "Cyber Warriors",
        price: 15.99,
        genre: "Action",
        description: "Combattez dans un monde cyberpunk futuriste. Affrontez des ennemis robotiques et explorez des mégalopoles futuristes.",
        iconHash: "demo-icon-2",
        bannerHash: "demo-banner-2",
      },
      {
        gameId: "demo-3",
        name: "Mystic Realms",
        price: 12.0,
        genre: "RPG",
        description: "Plongez dans un monde de magie et d'aventure. Incarnez un héros et explorez des donjons mystérieux.",
        iconHash: "demo-icon-3",
        bannerHash: "demo-banner-3",
      },
      {
        gameId: "demo-4",
        name: "Neon Racing",
        price: 24.99,
        genre: "Course",
        description: "Course de vitesse dans un univers néon futuriste. Défiez vos amis dans des circuits épiques.",
        iconHash: "demo-icon-4",
        bannerHash: "demo-banner-4",
      },
      {
        gameId: "demo-5",
        name: "Space Colony",
        price: 18.5,
        genre: "Simulation",
        description: "Construisez et gérez votre propre colonie spatiale. Survivez aux défis de l'espace.",
        iconHash: "demo-icon-5",
        bannerHash: "demo-banner-5",
      },
    ];

    // Utiliser les données de l'API ou les jeux de démonstration
    const games = apiGames && Array.isArray(apiGames) ? apiGames.slice(0, 6) : demoGames;

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
    };

    // Auto-défilement toutes les 5 secondes
    useEffect(() => {
      if (games.length <= 1) return;

      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % games.length);
      }, 5000);

      return () => clearInterval(interval);
    }, [games.length]);

    if (loading) {
      return (
        <div className="glass-content-card mb-12">
          <h2 className="text-center mb-8" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
            <span className="glass-method get">Jeux Populaires</span>
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin"></div>
            <span className="ml-3" style={{ color: "var(--glass-text)" }}>
              Chargement...
            </span>
          </div>
        </div>
      );
    }

    if (games.length === 0) {
      return (
        <div className="glass-content-card mb-12">
          <h2 className="text-center mb-8" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
            <span className="glass-method get">Jeux Populaires</span>
          </h2>
          <div className="text-center py-12" style={{ color: "var(--glass-text-secondary)" }}>
            Aucun jeu disponible pour le moment.
          </div>
        </div>
      );
    }

    return (
      <div className="glass-content-card mb-12">
        <h2 className="text-center mb-8" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
          <span className="glass-method get">Jeux Populaires</span>
          {fromCache && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--glass-accent)", color: "var(--glass-text)" }}>
              📦 Cache
            </span>
          )}
        </h2>

        <div className="flex items-center gap-4">
          {/* Bouton navigation gauche */}
          <button onClick={prevSlide} className="glass-button-neon w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {/* Carrousel */}
          <div className="flex-1 overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {games.map((game, index) => (
                <div key={game.gameId} className="w-full flex-shrink-0 px-4">
                  <div className="glass-card relative overflow-hidden group">
                    {/* Image de fond du jeu */}
                    {game.bannerHash && (
                      <div className="absolute inset-0">
                        <ImageCache src={`/banners-icons/${game.bannerHash}`} alt={game.name} className="w-full h-full object-cover opacity-20" cacheKey={`banner_${game.gameId}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}

                    <div className="relative z-10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {/* Icône du jeu */}
                          <ImageCache src={game.iconHash ? `/games-icons/${game.iconHash}` : "/games-icons/default.avif"} alt={game.name} className="w-24 h-24 object-contain rounded-xl glass-card border-2 border-glass-border" cacheKey={`icon_${game.gameId}`} />
                          <div>
                            <h3 className="text-2xl font-bold" style={{ color: "var(--glass-text)" }}>
                              {game.name}
                            </h3>
                            {game.genre && (
                              <span className="text-sm" style={{ color: "var(--glass-text-secondary)" }}>
                                {game.genre}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faStar} className="text-neon-yellow" />
                          <span className="text-sm font-semibold" style={{ color: "var(--glass-text-secondary)" }}>
                            4.8
                          </span>
                        </div>
                      </div>
                      <p className="mb-4" style={{ color: "var(--glass-text-secondary)" }}>
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-neon-yellow">{game.price}</span>
                            <ImageCache src="/assets/credit.avif" alt="credits" className="w-5 h-5" cacheKey="credit_icon" />
                          </div>
                        </div>
                        <Link href={`/game?gameId=${game.gameId}`}>
                          <button className="glass-button-neon">
                            <FontAwesomeIcon icon={faRocket} className="mr-2" />
                            Jouer
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton navigation droite */}
          <button onClick={nextSlide} className="glass-button-neon w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        {/* Indicateurs de pagination */}
        <div className="flex justify-center mt-6 gap-2">
          {games.map((_, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-neon-blue" : "bg-glass-border hover:bg-glass-accent"}`} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/game-shop">
            <button className="glass-button-neon glass-glow">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faStar} />
                Découvrir tous les jeux
              </span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Version Desktop
  function HomeDesktop() {
    return (
      <>
        <div className="glass-page-container">
          {/* Hero Section avec thème sombre */}
          <div className="glass-card mb-12 text-center relative overflow-hidden">
            {/* Étoiles scintillantes supprimées */}
            <div className="mb-8 relative z-10">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">Bienvenue dans l'univers Croissant</h1>
              <p className="text-xl mb-8" style={{ color: "var(--glass-text-secondary)" }}>
                Plongez dans l'univers gaming ultime avec une expérience immersive unique
              </p>
              <div className="flex justify-center gap-6">
                <button className="glass-button-neon glass-glow">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} />
                    Commencer l'aventure
                  </span>
                </button>
                <button className="glass-button">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCode} />
                    En savoir plus
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid de cartes glassmorphism */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="glass-content-card">
              <h2 className="mb-6" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
                <span className="glass-method post">{t("index.overview.title")}</span>
              </h2>
              {overviewDetails.map(({ summary, content }) => (
                <div className="glass-details mb-4" key={summary}>
                  {/* On enlève le style de puce devant le titre bleu */}
                  <summary className="glass-details-summary list-none pl-0">{summary}</summary>
                  <div className="mt-4">{content}</div>
                </div>
              ))}
            </div>

            <div className="glass-content-card">
              <h2 id="about-us" className="mb-6" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
                <span className="glass-method put">{t("index.about.title")}</span>
              </h2>
              {aboutDetails.map(({ summary, content }) => (
                <div className="glass-details mb-4" key={summary}>
                  <summary className="glass-details-summary list-none pl-0">{summary}</summary>
                  <div className="mt-4">{content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Open Source */}
          <div className="glass-content-card mb-12">
            <h2 className="text-center mb-8" style={{ color: "var(--glass-text)", fontSize: "1.5rem", fontWeight: "bold" }}>
              Projet Open Source
            </h2>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 text-neon-blue">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--glass-text)" }}>
                Contribuez à l'Évolution
              </h3>
              <p className="text-lg mb-6" style={{ color: "var(--glass-text-secondary)" }}>
                Croissant est un projet <strong style={{ color: "var(--glass-text)" }}>open source</strong> où chaque contribution compte. Rejoignez notre communauté de développeurs passionnés et aidez-nous à façonner l'avenir du gaming.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card text-center">
                <div className="text-3xl mb-3 text-neon-blue">
                  <FontAwesomeIcon icon={faCode} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--glass-text)" }}>
                  Développement
                </h4>
                <p className="text-sm" style={{ color: "var(--glass-text-secondary)" }}>
                  Code, features, corrections de bugs
                </p>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl mb-3 text-neon-purple">
                  <FontAwesomeIcon icon={faPalette} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--glass-text)" }}>
                  Design
                </h4>
                <p className="text-sm" style={{ color: "var(--glass-text-secondary)" }}>
                  UI/UX, graphismes, animations
                </p>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl mb-3 text-neon-green">
                  <FontAwesomeIcon icon={faFileText} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--glass-text)" }}>
                  Documentation
                </h4>
                <p className="text-sm" style={{ color: "var(--glass-text-secondary)" }}>
                  Guides, tutoriels, traductions
                </p>
              </div>
              <div className="glass-card text-center">
                <div className="text-3xl mb-3 text-neon-orange">
                  <FontAwesomeIcon icon={faFlask} />
                </div>
                <h4 className="font-semibold mb-2" style={{ color: "var(--glass-text)" }}>
                  Tests
                </h4>
                <p className="text-sm" style={{ color: "var(--glass-text-secondary)" }}>
                  QA, feedback, suggestions
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <button className="glass-button-neon glass-glow">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faStar} />
                  Rejoindre la Communauté
                </span>
              </button>
            </div>
          </div>

          {/* Carrousel des Jeux du Shop */}
          {/* <GameCarousel /> */}
        </div>
      </>
    );
  }

  // Version Mobile
  function HomeMobile() {
    return (
      <>
        <div className="glass-page-container !max-w-[1000px]">
          {/* Hero Section Mobile */}
          <div className="glass-card !mt-0 !mx-0 mb-8 text-center relative overflow-hidden">
            {/* Étoiles scintillantes supprimées */}
            <div className="mb-6 relative z-10">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">Bienvenue dans l'univers Croissant</h1>
              <p className="text-base mb-6" style={{ color: "var(--glass-text-secondary)" }}>
                Plongez dans l'univers gaming ultime avec une expérience immersive unique
              </p>
              <div className="flex flex-col gap-3">
                <button className="glass-button-neon glass-glow w-full">
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faStar} />
                    Commencer l'aventure
                  </span>
                </button>
                <button className="glass-button w-full">
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faCode} />
                    En savoir plus
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-content-card !mt-0 !mx-0 mb-6">
            <h2 className="!text-[1.1rem] mb-4" style={{ color: "var(--glass-text)", fontWeight: "bold" }}>
              <span className="glass-method post">{t("index.overview.title")}</span>
            </h2>
            {overviewDetails.map(({ summary, content }) => (
              <div className="glass-details !mb-3 !p-3" key={summary}>
                <summary className="glass-details-summary !text-base !py-2 list-none pl-0">{summary}</summary>
                <div className="mt-3">{content}</div>
              </div>
            ))}
          </div>

          <div className="glass-content-card !mt-4 !mx-0">
            <h2 id="about-us" className="!text-[1.1rem] !mt-[18px] mb-4" style={{ color: "var(--glass-text)", fontWeight: "bold" }}>
              <span className="glass-method put">{t("index.about.title")}</span>
            </h2>
            {aboutDetails.map(({ summary, content }) => (
              <div className="glass-details !mb-3 !p-3" key={summary}>
                <summary className="glass-details-summary !text-base !py-2">{summary}</summary>
                <div className="mt-3">{content}</div>
              </div>
            ))}
          </div>

          {/* Section Open Source Mobile */}
          <div className="glass-content-card !mt-4 !mx-0 mb-6">
            <h2 className="!text-[1.1rem] mb-4" style={{ color: "var(--glass-text)", fontWeight: "bold" }}>
              <span className="glass-method get">Projet Open Source</span>
            </h2>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3 text-neon-blue">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: "var(--glass-text)" }}>
                Contribuez à l'Évolution
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--glass-text-secondary)" }}>
                Croissant est un projet <strong style={{ color: "var(--glass-text)" }}>open source</strong> où chaque contribution compte. Rejoignez notre communauté de développeurs passionnés.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card text-center !p-3">
                <div className="text-2xl mb-2 text-neon-blue">
                  <FontAwesomeIcon icon={faCode} />
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--glass-text)" }}>
                  Développement
                </h4>
                <p className="text-xs" style={{ color: "var(--glass-text-secondary)" }}>
                  Code, features, bugs
                </p>
              </div>
              <div className="glass-card text-center !p-3">
                <div className="text-2xl mb-2 text-neon-purple">
                  <FontAwesomeIcon icon={faPalette} />
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--glass-text)" }}>
                  Design
                </h4>
                <p className="text-xs" style={{ color: "var(--glass-text-secondary)" }}>
                  UI/UX, graphismes
                </p>
              </div>
              <div className="glass-card text-center !p-3">
                <div className="text-2xl mb-2 text-neon-green">
                  <FontAwesomeIcon icon={faFileText} />
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--glass-text)" }}>
                  Documentation
                </h4>
                <p className="text-xs" style={{ color: "var(--glass-text-secondary)" }}>
                  Guides, traductions
                </p>
              </div>
              <div className="glass-card text-center !p-3">
                <div className="text-2xl mb-2 text-neon-orange">
                  <FontAwesomeIcon icon={faFlask} />
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "var(--glass-text)" }}>
                  Tests
                </h4>
                <p className="text-xs" style={{ color: "var(--glass-text-secondary)" }}>
                  QA, feedback
                </p>
              </div>
            </div>
            <div className="text-center">
              <button className="glass-button-neon glass-glow w-full">
                <span className="flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faStar} />
                  Rejoindre la Communauté
                </span>
              </button>
            </div>
          </div>

          {/* Carrousel des Jeux du Shop Mobile */}
          <div className="!mt-4 !mx-0 mb-6">
            {/* <GameCarousel /> */}
          </div>
        </div>
      </>
    );
  }

  useEffect(() => {
    // Fix: check for the cookie "from=app" and redirect if present
    if (typeof document !== "undefined" && document.cookie.includes("from=app")) {
      router.push("/launcher/home");
    }
  }, [router]);

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
