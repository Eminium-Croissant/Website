import React, { useEffect, useState } from "react";
import Highlight from "react-highlight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCode, faBook, faDownload } from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../hooks/useIsMobile"; // Ajoutez ce hook
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Swagger from "../components/swagger";

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
          <div className="flex gap-6 p-5 ">
            {/* Sidebar */}
            <aside style={{ height: swaggerHeight, overflow: "auto" }} className="glass-content-card rounded-lg p-6 h-fit flex-shrink-0 flex flex-col w-[300px] sticky top-5">
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
            <div className="glass-content-card p-4" style={{ height: swaggerHeight, overflow: "auto" }}>
              {/* Swagger UI with deepLinking enabled for anchors */}
              <Swagger />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassMethodBadge({ method }: { method: string }) {
  // Méthodes stylées comme sur index.tsx
  const methodClass = method === "GET" ? "glass-method get" : method === "POST" ? "glass-method post" : method === "PUT" ? "glass-method put" : method === "DELETE" ? "glass-method delete" : "glass-method";
  return (
    <span className={methodClass} style={{ marginRight: 8 }}>
      {method}
    </span>
  );
}

// Bloc d'affichage d'un endpoint (utilisé dans mobile et desktop)

function InfoSection({ title, content, language }: { title: string; content: any; language: string }) {
  const { t } = useTranslation("common");
  return (
    <>
      {content ? (
        <div className="mb-4">
          <h4 className="text-neon-blue mb-3 font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faCode} className="text-sm" />
            {t(title)}:
          </h4>
          <div className="glass-card p-4 rounded-lg overflow-x-auto">
            <Highlight className={language}>{typeof content === "string" ? content : JSON.stringify(content, null, 2)}</Highlight>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
