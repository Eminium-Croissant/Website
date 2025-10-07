import React from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faBook } from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../hooks/useIsMobile";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const Swagger = dynamic(() => import("../components/swagger"), { ssr: false });

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default function ApiDocs() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  const sdkLanguages = ["ts-and-js:TypeScript/JavaScript", "python:Python", "java:Java", "cs:C#", "php:PHP", "ruby:Ruby", "rust:Rust", "go:Go", "cpp:C++"];

  const swaggerHeight = isMobile ? "calc(100vh - 220px)" : "calc(100vh - 120px)";

  return (
    <div className="glass-page-container">
      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="glass-card rounded-lg shadow-glass overflow-hidden max-w-full">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "var(--glass-text)" }}>
            <FontAwesomeIcon icon={faCode} className="mr-3 text-neon-blue" />
            {t("apiDocs.title") || "API Documentation"}
          </h2>{" "}
          <div className={`flex gap-6 p-5 ${isMobile ? "flex-col" : ""}`}>
            {/* Sidebar */}
            <aside
              style={{
                height: swaggerHeight,
                overflow: "auto",
                width: isMobile ? "100%" : "300px",
                marginBottom: isMobile ? "1rem" : "0",
              }}
              className="glass-content-card rounded-lg p-6 h-fit flex-shrink-0 flex flex-col sticky top-5"
            >
              <h3 className="text-lg font-medium mb-4" style={{ color: "var(--glass-text)" }}>
                <FontAwesomeIcon icon={faBook} className="mr-2 text-neon-blue" />
                {t("apiDocs.libraries") || "Libraries"}
              </h3>
              <ul className="list-none p-0 flex flex-col space-y-2.5">
                {sdkLanguages.map((sdk) => {
                  const [id, name] = sdk.split(":");
                  return (
                    <li key={id}>
                      <a href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${id}/README.md`} target="_blank" rel="noreferrer" className="text-neon-blue no-underline hover:text-neon-purple transition-colors flex items-center gap-2">
                        <FontAwesomeIcon icon={faCode} className="text-sm" />[{name} Library]
                      </a>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <div
              className="glass-content-card p-4"
              style={{
                height: swaggerHeight,
                overflow: "auto",
                width: isMobile ? "100%" : "auto",
              }}
            >
              {/* Swagger UI with deepLinking enabled for anchors */}
              <Swagger />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
