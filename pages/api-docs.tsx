import React, { useEffect, useState } from "react";
import Highlight from "react-highlight";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCode, faBook, faDownload } from "@fortawesome/free-solid-svg-icons";
import useIsMobile from "../hooks/useIsMobile"; // Ajoutez ce hook
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const API_URL = "/api";

// Memoized docs and grouped state (module-level, survives remounts)
let apiDocsCache: any[] | null = null;
let apiDocsGroupedCache: Record<string, any[]> | null = null;
let apiDocsCategoryListCache: string[] | null = null;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

function useApiDocs() {
  const [docs, setDocs] = useState<any[]>(apiDocsCache || []);
  const [categories, setCategories] = useState<Record<string, any[]>>(apiDocsGroupedCache || {});
  const [categoryList, setCategoryList] = useState<string[]>(apiDocsCategoryListCache || []);
  const [loading, setLoading] = useState(!apiDocsCache);

  useEffect(() => {
    if (apiDocsCache && apiDocsGroupedCache && apiDocsCategoryListCache) {
      setDocs(apiDocsCache);
      setCategories(apiDocsGroupedCache);
      setCategoryList(apiDocsCategoryListCache);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(API_URL + "/describe")
        .then((res) => res.json())
        .then((data) => {
          apiDocsCache = data;
          setDocs(data);
          // Group docs by category and then by endpoint
          const grouped = data.reduce((acc: Record<string, any[]>, doc: any) => {
            const cat = doc.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(doc);
            return acc;
          }, {});
          // Further group by endpoint
          Object.keys(grouped).forEach((category) => {
            const endpoints: Record<string, any[]> = {};
            grouped[category].forEach((doc: any) => {
              const endpointKey = doc.method + " " + doc.endpoint;
              if (!endpoints[endpointKey]) {
                endpoints[endpointKey] = [];
              }
              endpoints[endpointKey].push(doc);
            });
            grouped[category] = Object.values(endpoints);
          });
          apiDocsGroupedCache = grouped;
          apiDocsCategoryListCache = Object.keys(grouped);
          setCategories(grouped);
          setCategoryList(Object.keys(grouped));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, []);

  return { docs, categories, categoryList, loading };
}

export default function ApiDocs() {
  const isMobile = useIsMobile();
  return isMobile ? <ApiDocsMobile /> : <ApiDocsDesktop />;
}

// Version Desktop
function ApiDocsDesktop() {
  const { t } = useTranslation("common");
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = docs.filter((doc) => doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs([]);
    }
  }, [searchTerm, docs]);

  const displayedCategories = searchTerm ? [] : selectedCategory ? [selectedCategory] : categoryList;

  const getDocsForCategory = (cat: string) => {
    if (searchTerm) {
      return filteredDocs;
    }
    return categories[cat] || [];
  };

  const sdkLanguages = ["ts-and-js:TypeScript/JavaScript", "python:Python", "java:Java", "cs:C#", "php:PHP", "ruby:Ruby", "rust:Rust", "go:Go", "cpp:C++"];

  return (
    <div className="glass-page-container">
      <div className="flex gap-6 p-5 glass-card rounded-lg shadow-glass overflow-auto max-w-full">
        {/* Sidebar */}
        <aside className="glass-content-card rounded-lg p-6 h-fit flex-shrink-0 flex flex-col w-[300px] sticky top-5">
          {/* Search Input */}
          <div className="mb-6">
            <input 
              type="text" 
              placeholder={t("apiDocs.searchPlaceholder")} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="glass-input w-full p-2.5 rounded-md" 
            />
          </div>
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{color: 'var(--glass-text)'}}>
              <FontAwesomeIcon icon={faBook} className="mr-2 text-neon-blue" />
              {t("apiDocs.categories")}
            </h3>
            <ul className="list-none p-0 space-y-2.5">
              <li 
                className={`cursor-pointer transition-colors hover:text-neon-blue ${selectedCategory === null ? "text-neon-blue font-medium" : ""}`} 
                style={{color: selectedCategory === null ? 'var(--neon-blue)' : 'var(--glass-text-secondary)'}}
                onClick={() => setSelectedCategory(null)}
              >
                {t("apiDocs.all")}
              </li>
              {categoryList.map((cat) => (
                <li 
                  key={cat} 
                  className={`cursor-pointer transition-colors hover:text-neon-blue ${selectedCategory === cat ? "text-neon-blue font-medium" : ""}`} 
                  style={{color: selectedCategory === cat ? 'var(--neon-blue)' : 'var(--glass-text-secondary)'}}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <hr className="border-glass-border my-6" />
          {/* SDKs */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{color: 'var(--glass-text)'}}>
              <FontAwesomeIcon icon={faDownload} className="mr-2 text-neon-purple" />
              {t("apiDocs.libraries")}
            </h3>
            <ul className="list-none p-0 flex flex-col space-y-2.5">
              {sdkLanguages.map((sdk) => {
                const [id, name] = sdk.split(":");
                return (
                  <li key={id}>
                    <a 
                      href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${id}/README.md`} 
                      target="_blank" 
                      className="text-neon-blue no-underline hover:text-neon-purple transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCode} className="text-sm" />
                      [{name} Library]
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold mb-6" style={{color: 'var(--glass-text)'}}>
            <FontAwesomeIcon icon={faCode} className="mr-3 text-neon-blue" />
            {t("apiDocs.title")}
          </h2>
          <div className="glass-content-card mb-6">
            <div className="text-base mb-4" style={{color: 'var(--glass-text-secondary)'}}>
              {t("apiDocs.intro")}
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4" style={{color: 'var(--glass-text)'}}>
                <FontAwesomeIcon icon={faUsers} className="text-neon-blue" />
                <span className="font-semibold">{t("apiDocs.requiresAuth")}</span>
              </div>
              <div style={{color: 'var(--glass-text-secondary)'}}>
                <strong style={{color: 'var(--glass-text)'}}>{t("apiDocs.precisions")}</strong>
                <br />
                <br />
                {t("apiDocs.iconHash")}
                <br />
                {t("apiDocs.bannerHash")}
                <br />
                {t("apiDocs.splashHash")}
                <br />
                {t("apiDocs.hashes")}
              </div>
            </div>
          </div>

          <div className="glass-content-card">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin"></div>
                <span className="ml-3" style={{color: 'var(--glass-text)'}}>{t("apiDocs.loading")}</span>
              </div>
            ) : searchTerm && filteredDocs.length === 0 && !loading ? (
              <div className="text-center py-8" style={{color: 'var(--glass-text)'}}>
                <FontAwesomeIcon icon={faCode} className="text-4xl mb-4 text-neon-blue opacity-50" />
                <p>{t("apiDocs.noResults", { searchTerm })}</p>
              </div>
            ) : (
              // Original category-based display
              displayedCategories.map((cat) => (
                <div key={cat} className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 pb-2 border-b border-glass-border" style={{color: 'var(--neon-blue)'}}>
                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                    {cat}
                  </h3>
                  {getDocsForCategory(cat)?.map((endpointGroup) => {
                    const doc = endpointGroup[0];
                    return (
                      <div className="glass-card mb-6 p-4" key={doc.endpoint} id={doc.endpoint}>
                        <a 
                          href={`#${doc.endpoint}`} 
                          className="text-neon-blue no-underline hover:text-neon-purple transition-colors text-lg font-semibold flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCode} className="text-sm" />
                          {doc.endpoint}
                        </a>
                        <div className="mt-4">
                          <InfoSection title="apiDocs.responseType" content={doc.responseType} language="javascript" />
                          <InfoSection title="apiDocs.params" content={doc.params} language="javascript" />
                          <InfoSection title="apiDocs.query" content={doc.query} language="javascript" />
                          <InfoSection title="apiDocs.body" content={doc.body} language="javascript" />
                          <InfoSection title="apiDocs.example" content={doc.example} language="javascript" />
                          <InfoSection title="apiDocs.exampleResponse" content={doc.exampleResponse} language="json" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Version Mobile
function ApiDocsMobile() {
  const { t } = useTranslation("common");
  const { docs, categories, categoryList, loading } = useApiDocs();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = docs.filter((doc) => doc.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredDocs(filtered);
    } else {
      setFilteredDocs([]);
    }
  }, [searchTerm, docs]);

  const displayedCategories = searchTerm ? [] : selectedCategory ? [selectedCategory] : categoryList;

  const getDocsForCategory = (cat: string) => {
    if (searchTerm) {
      return filteredDocs;
    }
    return categories[cat] || [];
  };

  const sdkLanguages = ["ts-and-js:TypeScript/JavaScript", "python:Python", "java:Java", "cs:C#", "php:PHP", "ruby:Ruby", "rust:Rust", "go:Go", "cpp:C++"];

  return (
    <div className="glass-page-container">
      <div className="glass-card rounded-lg shadow-glass max-w-full text-[0.95rem] m-0 p-4">
        {/* Barre de recherche et catégories en haut */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder={t("apiDocs.searchPlaceholder")} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="glass-input w-full p-3 rounded-md text-base" 
          />
        </div>
        <div className="mb-6">
          <h3 className="mb-4 text-[1.1em] flex items-center gap-2" style={{color: 'var(--glass-text)'}}>
            <FontAwesomeIcon icon={faBook} className="text-neon-blue" />
            {t("apiDocs.categories")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${selectedCategory === null ? "glass-button-neon" : "glass-button"}`}
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm("");
              }}
            >
              {t("apiDocs.all")}
            </span>
            {categoryList.map((cat) => (
              <span
                key={cat}
                className={`px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${selectedCategory === cat ? "glass-button-neon" : "glass-button"}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchTerm("");
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
        <hr className="border-glass-border my-6" />
        {/* SDKs */}
        <div className="mb-6">
          <h3 className="mb-4 text-[1.1em] flex items-center gap-2" style={{color: 'var(--glass-text)'}}>
            <FontAwesomeIcon icon={faDownload} className="text-neon-purple" />
            {t("apiDocs.libraries")}
          </h3>
          <ul className="list-none p-0 text-[0.98em] flex flex-wrap gap-2">
            {sdkLanguages.map((sdk) => {
              const [id, name] = sdk.split(":");
              return (
                <li key={id}>
                  <a 
                    href={`https://github.com/Croissant-API/Website/tree/main/public/downloadables/sdk-${id}/README.md`} 
                    target="_blank" 
                    className="text-neon-blue no-underline hover:text-neon-purple transition-colors flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faCode} className="text-sm" />
                    [{name} Library]
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{color: 'var(--glass-text)'}}>
            <FontAwesomeIcon icon={faCode} className="text-neon-blue" />
            {t("apiDocs.title")}
          </h2>
          <div className="glass-content-card mb-4">
            <div className="text-[0.98em] mb-4" style={{color: 'var(--glass-text-secondary)'}}>
              {t("apiDocs.intro")}
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4" style={{color: 'var(--glass-text)'}}>
                <FontAwesomeIcon icon={faUsers} className="text-neon-blue" />
                <span className="font-semibold">{t("apiDocs.requiresAuth")}</span>
              </div>
              <div style={{color: 'var(--glass-text-secondary)'}}>
                <strong style={{color: 'var(--glass-text)'}}>{t("apiDocs.precisions")}</strong>
                <br />
                <br />
                {t("apiDocs.iconHash")}
                <br />
                {t("apiDocs.bannerHash")}
                <br />
                {t("apiDocs.splashHash")}
                <br />
                {t("apiDocs.hashes")}
              </div>
            </div>
          </div>
          <div className="glass-content-card">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-glass-border border-t-neon-blue rounded-full animate-spin"></div>
                <span className="ml-3" style={{color: 'var(--glass-text)'}}>{t("apiDocs.loading")}</span>
              </div>
            ) : searchTerm ? (
              filteredDocs.map((doc) => <DocBlock key={doc.endpoint} doc={doc} />)
            ) : (
              displayedCategories.map((cat) => (
                <div key={cat} className="mb-6">
                  <h3 className="text-xl font-bold mb-4 pb-2 border-b border-glass-border flex items-center gap-2" style={{color: 'var(--neon-blue)'}}>
                    <FontAwesomeIcon icon={faBook} />
                    {cat}
                  </h3>
                  {getDocsForCategory(cat)?.map((endpointGroup) => {
                    const doc = endpointGroup[0];
                    return <DocBlock key={doc.endpoint} doc={doc} />;
                  })}
                </div>
              ))
            )}
            {searchTerm && filteredDocs.length === 0 && !loading && (
              <div className="text-center py-8" style={{color: 'var(--glass-text)'}}>
                <FontAwesomeIcon icon={faCode} className="text-4xl mb-4 text-neon-blue opacity-50" />
                <p>No results found for "{searchTerm}".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bloc d'affichage d'un endpoint (utilisé dans mobile et desktop)
function DocBlock({ doc }: { doc: any }) {
  const { t } = useTranslation("common");
  return (
    <div className="glass-card mb-4 p-4" key={doc.endpoint} id={doc.endpoint}>
      <a 
        href={`#${doc.endpoint}`} 
        className="text-neon-blue no-underline hover:text-neon-purple transition-colors text-lg font-semibold flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faCode} className="text-sm" />
        {doc.endpoint}
      </a>
      <div className="mt-4">
        <InfoSection title="apiDocs.responseType" content={doc.responseType} language="javascript" />
        <InfoSection title="apiDocs.params" content={doc.params} language="javascript" />
        <InfoSection title="apiDocs.query" content={doc.query} language="javascript" />
        <InfoSection title="apiDocs.body" content={doc.body} language="javascript" />
        <InfoSection title="apiDocs.example" content={doc.example} language="javascript" />
        <InfoSection title="apiDocs.exampleResponse" content={doc.exampleResponse} language="json" />
      </div>
    </div>
  );
}

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
