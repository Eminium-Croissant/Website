import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileText, faGavel, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
/**
 * Terms of Service page for Croissant.
 * Displays the rules and guidelines for using the platform.
 */
const TermsOfService: React.FC = () => {
  const [openFr, setOpenFr] = useState(false);
  const [openEn, setOpenEn] = useState(false);
  const { t } = useTranslation("common");

  return (
    <div className="glass-page-container">
      <div className="glass-content-card max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: "var(--glass-text)" }}>
          <span className="glass-method get">
            <FontAwesomeIcon icon={faFileText} className="mr-3" />
            {t("tos.title")}
          </span>
        </h1>

        <div className="glass-content-card mb-8">
          <p className="text-lg mb-6" style={{ color: "var(--glass-text-secondary)" }}>
            {t("tos.intro")}
          </p>

          {/* Section 1 */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-blue)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.1.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.1")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.1.1")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.1.2")}</p>
          </div>

          {/* Section 2 */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-purple)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.2.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.2")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.2.1")}
            </p>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.2.2")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.2.3")}</p>
          </div>

          {/* Section 3 */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-pink)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.3.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.3")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.3.1")}
            </p>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.3.2")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.3.3")}</p>
          </div>

          {/* Section 4 */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-green)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.4.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.4")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.4.1")}
            </p>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.4.2")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.4.3")}</p>
          </div>

          {/* Section 5 */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-orange)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.5.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.5")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.5.1")}
            </p>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.5.2")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.5.3")}</p>
          </div>

          {/* Section 6 */}
          <div className="glass-card p-6 mb-8">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--neon-cyan)" }}>
              <FontAwesomeIcon icon={faGavel} className="mr-2" />
              {t("tos.6.title")}
            </h3>
            <div className="font-semibold mb-4" style={{ color: "var(--glass-text)" }}>
              {t("tos.6")}
            </div>
            <p className="mb-3" style={{ color: "var(--glass-text-secondary)" }}>
              {t("tos.6.1")}
            </p>
            <p style={{ color: "var(--glass-text-secondary)" }}>{t("tos.6.2")}</p>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "var(--glass-text)" }}>
            <span className="glass-method put">
              <FontAwesomeIcon icon={faGavel} className="mr-3" />
              {t("tos.legalMentions")}
            </span>
          </h2>

          {/* Dropdown Français */}
          <div className="glass-card mb-6">
            <button onClick={() => setOpenFr((v) => !v)} className="glass-button-neon w-full flex items-center justify-between p-4 text-left">
              <span className="flex items-center">
                <FontAwesomeIcon icon={faGavel} className="mr-3 text-neon-blue" />
                Mentions légales (Français)
              </span>
              <FontAwesomeIcon icon={openFr ? faChevronUp : faChevronDown} className="text-neon-blue transition-transform duration-300" />
            </button>
            {openFr && (
              <div className="glass-card mt-4 p-6">
                <div className="space-y-4">
                  <p style={{ color: "var(--glass-text-secondary)" }}>
                    Croissant est édité par Fox (fox3000foxy), développeur indépendant basé en France. Pour toute question ou demande concernant le site, vous pouvez nous contacter via Discord ou par email à l'adresse indiquée sur notre serveur officiel,{" "}
                    <a href="mailto:contact@croissant-api.fr" className="text-neon-blue hover:text-neon-purple transition-colors">
                      contact@croissant-api.fr
                    </a>
                    .
                  </p>
                  <p style={{ color: "var(--glass-text-secondary)" }}>Les données personnelles collectées sont uniquement utilisées pour le bon fonctionnement du service et ne sont jamais revendues à des tiers.</p>
                  <p style={{ color: "var(--glass-text-secondary)" }}>
                    Le site est hébergé par Skorpia, une association basée en France, dont le président est Eliott M. Pour toute question relative à l'hébergement, vous pouvez contacter Skorpia à{" "}
                    <a href="mailto:contact@skorpia.fr" className="text-neon-blue hover:text-neon-purple transition-colors">
                      contact@skorpia.fr
                    </a>
                    .
                  </p>
                  <div className="glass-card p-4">
                    <p className="mb-2" style={{ color: "var(--glass-text-secondary)" }}>
                      L'hébergeur est conforme au RGPD.
                    </p>
                    <p className="mb-2" style={{ color: "var(--glass-text-secondary)" }}>
                      Aucun cookie tiers n'est utilisé sur ce site.
                    </p>
                    <p style={{ color: "var(--glass-text-secondary)" }}>Toute reproduction, même partielle, du contenu du site est interdite sans autorisation préalable.</p>
                  </div>

                  <div className="glass-card p-4">
                    <h4 className="text-lg font-bold mb-3" style={{ color: "var(--neon-blue)" }}>
                      Informations légales (Hébergement)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Nom de l'association :</strong> SKORPIA
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Statut juridique :</strong> Association loi 1901
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Siège social :</strong> 2 avenue Pasteur, 76000 Rouen
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Numéro de déclaration :</strong> W142017282
                        </p>
                      </div>
                      <div>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Email :</strong>{" "}
                          <a href="mailto:contact@skorpia.fr" className="text-neon-blue hover:text-neon-purple transition-colors">
                            contact@skorpia.fr
                          </a>
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Téléphone :</strong> +33 782 620 861
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Directeur de la publication :</strong> Eliot Mafille
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-glass-border">
                      <h4 className="text-lg font-bold mb-3" style={{ color: "var(--neon-purple)" }}>
                        Hébergement du site
                      </h4>
                      <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Nom de l'hébergeur :</strong> SKORPIA
                      </p>
                      <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Adresse de l'hébergeur :</strong> 2 avenue Pasteur, 76000 Rouen
                      </p>
                      <p style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Contact hébergeur :</strong>{" "}
                        <a href="mailto:contact@skorpia.fr" className="text-neon-blue hover:text-neon-purple transition-colors">
                          contact@skorpia.fr
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown English */}
          <div className="glass-card">
            <button onClick={() => setOpenEn((v) => !v)} className="glass-button-neon w-full flex items-center justify-between p-4 text-left">
              <span className="flex items-center">
                <FontAwesomeIcon icon={faGavel} className="mr-3 text-neon-purple" />
                Legal Mentions (English)
              </span>
              <FontAwesomeIcon icon={openEn ? faChevronUp : faChevronDown} className="text-neon-purple transition-transform duration-300" />
            </button>
            {openEn && (
              <div className="glass-card mt-4 p-6">
                <div className="space-y-4">
                  <p style={{ color: "var(--glass-text-secondary)" }}>
                    Croissant is published by Fox (fox3000foxy), an independent developer based in France. For any questions or requests regarding the site, you can contact us via Discord or by email at the address provided on our official server,{" "}
                    <a href="mailto:contact@croissant-api.fr" className="text-neon-purple hover:text-neon-pink transition-colors">
                      contact@croissant-api.fr
                    </a>
                    .
                  </p>
                  <p style={{ color: "var(--glass-text-secondary)" }}>The personal data collected is only used for the proper functioning of the service and is never resold to third parties.</p>
                  <p style={{ color: "var(--glass-text-secondary)" }}>
                    The site is hosted by Skorpia, an association based in France, whose CEO is Eliott M. For any questions relating to hosting, you can contact Skorpia at{" "}
                    <a href="mailto:contact@skorpia.fr" className="text-neon-purple hover:text-neon-pink transition-colors">
                      contact@skorpia.fr
                    </a>
                    .
                  </p>
                  <div className="glass-card p-4">
                    <p className="mb-2" style={{ color: "var(--glass-text-secondary)" }}>
                      The host complies with the GDPR.
                    </p>
                    <p className="mb-2" style={{ color: "var(--glass-text-secondary)" }}>
                      No third-party cookies are used on this site.
                    </p>
                    <p style={{ color: "var(--glass-text-secondary)" }}>Any reproduction, even partial, of the content of the site is prohibited without prior authorization.</p>
                  </div>

                  <div className="glass-card p-4">
                    <h4 className="text-lg font-bold mb-3" style={{ color: "var(--neon-purple)" }}>
                      Legal Information (Hosting)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Association Name:</strong> SKORPIA
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Legal Status:</strong> Association loi 1901
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Registered Office:</strong> 2 avenue Pasteur, 76000 Rouen
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Declaration Number:</strong> W142017282
                        </p>
                      </div>
                      <div>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Email Address:</strong>{" "}
                          <a href="mailto:contact@skorpia.fr" className="text-neon-purple hover:text-neon-pink transition-colors">
                            contact@skorpia.fr
                          </a>
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Phone Number:</strong> +33 782 620 861
                        </p>
                        <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                          <strong>Director of Publication:</strong> Eliot Mafille
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-glass-border">
                      <h4 className="text-lg font-bold mb-3" style={{ color: "var(--neon-pink)" }}>
                        Website Hosting
                      </h4>
                      <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Host Name:</strong> SKORPIA
                      </p>
                      <p className="mb-1" style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Host Address:</strong> 2 avenue Pasteur, 76000 Rouen
                      </p>
                      <p style={{ color: "var(--glass-text-secondary)" }}>
                        <strong>Host Contact:</strong>{" "}
                        <a href="mailto:contact@skorpia.fr" className="text-neon-purple hover:text-neon-pink transition-colors">
                          contact@skorpia.fr
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
