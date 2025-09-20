import React, { Dispatch, SetStateAction, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import useIsMobile from "../../hooks/useIsMobile";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const endpoint = "/api";

const GameForm = () => {
  const isMobile = useIsMobile();
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    downloadLink: "",
    iconHash: "",
    bannerHash: "",
    showInStore: true,
    genre: "",
    release_date: "",
    developer: "",
    publisher: "",
    platforms: "",
    website: "",
    trailer_link: "",
    multiplayer: false,
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors]: [any, Dispatch<SetStateAction<any>>] = useState({});
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setFormData((f) => ({ ...f, iconHash: "" })); // reset hash if changing file
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
      setFormData((f) => ({ ...f, bannerHash: "" }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = t("createGame.error.name");
    if (!formData.description) newErrors.description = t("createGame.error.description");
    if (!formData.price) newErrors.price = t("createGame.error.price");
    if (!formData.downloadLink) newErrors.downloadLink = t("createGame.error.downloadLink");
    // iconFile is now optional
    // Banner is now optional
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
    setLoading(true);

    let iconHash = formData.iconHash;
    let bannerHash = formData.bannerHash;

    // Upload icon if file selected
    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/game-icon", {
          method: "POST",
          body: iconData,
        });
        const data = await res.json();
        if (data.hash) {
          iconHash = data.hash;
        } else {
          setErrors((err: any) => ({ ...err, iconHash: t("createGame.error.iconUpload") }));
          setLoading(false);
          return;
        }
      } catch {
        setErrors((err: any) => ({ ...err, iconHash: t("createGame.error.iconUpload") }));
        setLoading(false);
        return;
      }
    }

    // Upload banner if file selected
    if (bannerFile) {
      const bannerData = new FormData();
      bannerData.append("banner", bannerFile);
      try {
        const res = await fetch("/upload/banner", {
          method: "POST",
          body: bannerData,
        });
        const data = await res.json();
        if (data.hash) {
          bannerHash = data.hash;
        } else {
          setErrors((err: any) => ({ ...err, bannerHash: t("createGame.error.bannerUpload") }));
          setLoading(false);
          return;
        }
      } catch {
        setErrors((err: any) => ({ ...err, bannerHash: t("createGame.error.bannerUpload") }));
        setLoading(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      download_link: formData.downloadLink,
      showInStore: formData.showInStore,
      genre: formData.genre || null,
      release_date: formData.release_date || null,
      developer: formData.developer || null,
      publisher: formData.publisher || null,
      platforms: formData.platforms || null,
      website: formData.website || null,
      trailer_link: formData.trailer_link || null,
      multiplayer: formData.multiplayer,
      iconHash,
      bannerHash,
    };

    try {
      const res = await fetch(endpoint + "/games", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(t("createGame.success"));
        setFormData({
          name: "",
          description: "",
          price: "",
          downloadLink: "",
          iconHash: "",
          bannerHash: "",
          showInStore: true,
          genre: "",
          release_date: "",
          developer: "",
          publisher: "",
          platforms: "",
          website: "",
          trailer_link: "",
          multiplayer: false,
        });
        setIconFile(null);
        setBannerFile(null);
        // Redirection après succès
        router.push("/dev-zone/my-games");
        return;
      } else {
        const err = await res.json();
        setErrors({ submit: err.message || t("createGame.error.submit") });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || t("createGame.error.submit") });
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="glass-page-container flex justify-center items-center min-h-screen">
        <div className="glass-content-card max-w-[340px] w-full mx-auto p-6 rounded-xl text-center">
          <h2 className="mb-2">{t("createGame.mobile.title")}</h2>
          <p>{t("createGame.mobile.desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-page-container flex justify-center items-center min-h-screen">
      <div className="glass-content-card max-w-2xl w-full mx-auto p-8 rounded-xl">
        <div style={{ marginBottom: 18 }}>
          <Link href="/dev-zone/my-games" className="glass-button">
            &larr; {t("createGame.backToMyGames")}
          </Link>
        </div>
        <h1 className="creategame-title mb-6">
          <span>{t("createGame.title")}</span>
        </h1>
        <form onSubmit={handleSubmit} className="game-form">
          <div className="form-row">
            <label htmlFor="name">
              {t("createGame.name")} <span className="required">*</span>
            </label>
            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required className="dark-input" />
          </div>
          {errors.name && <span className="error">{errors.name}</span>}
          <div className="form-row">
            <label htmlFor="description">
              {t("createGame.description")} <span className="required">*</span>
            </label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="dark-input" />
          </div>
          {errors.description && <span className="error">{errors.description}</span>}
          <div className="form-row">
            <label htmlFor="price">
              {t("createGame.price")} <span className="required">*</span>
            </label>
            <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required min={0} step="any" className="dark-input" />
          </div>
          {errors.price && <span className="error">{errors.price}</span>}
          <div className="form-row">
            <label htmlFor="downloadLink">
              {t("createGame.downloadLink")} <span className="required">*</span>
            </label>
            <input id="downloadLink" type="url" name="downloadLink" value={formData.downloadLink} onChange={handleChange} required className="dark-input" />
          </div>
          {errors.downloadLink && <span className="error">{errors.downloadLink}</span>}
          <div className="form-row">
            <label htmlFor="image">{t("createGame.icon")}</label>
            <label htmlFor="image" className="custom-file-label creategame-file-label">
              {iconFile || formData.iconHash ? t("createGame.changeIcon") : t("createGame.chooseIcon")}
              <input id="image" type="file" name="image" accept="image/*" onChange={handleIconChange} className="dark-input" style={{ display: "none" }} />
            </label>
            {(iconFile || formData.iconHash) && <span className="creategame-ready">{t("createGame.ready")}</span>}
          </div>
          {errors.iconHash && <span className="error">{errors.iconHash}</span>}
          <div className="form-row">
            <label htmlFor="banner">{t("createGame.banner")}</label>
            <label htmlFor="banner" className="custom-file-label creategame-file-label">
              {bannerFile || formData.bannerHash ? t("createGame.changeBanner") : t("createGame.chooseBanner")}
              <input id="banner" type="file" name="banner" accept="image/*" onChange={handleBannerChange} className="dark-input" style={{ display: "none" }} />
            </label>
            {(bannerFile || formData.bannerHash) && <span className="creategame-ready">{t("createGame.ready")}</span>}
          </div>
          {errors.bannerHash && <span className="error">{errors.bannerHash}</span>}
          <div className="form-row">
            <label htmlFor="showInStore" className="creategame-checkbox-label">
              <input id="showInStore" type="checkbox" name="showInStore" checked={formData.showInStore} onChange={handleChange} className="creategame-checkbox" />
              {t("createGame.showInStore")}
            </label>
          </div>
          <div className="form-row">
            <label htmlFor="genre">{t("createGame.genre")}</label>
            <input id="genre" type="text" name="genre" value={formData.genre} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="release_date">{t("createGame.releaseDate")}</label>
            <input id="release_date" type="date" name="release_date" value={formData.release_date} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="developer">{t("createGame.developer")}</label>
            <input id="developer" type="text" name="developer" value={formData.developer} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="publisher">{t("createGame.publisher")}</label>
            <input id="publisher" type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="platforms">{t("createGame.platforms")}</label>
            <input id="platforms" type="text" name="platforms" value={formData.platforms} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="website">{t("createGame.website")}</label>
            <input id="website" type="url" name="website" value={formData.website} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="trailer_link">{t("createGame.trailerLink")}</label>
            <input id="trailer_link" type="url" name="trailer_link" value={formData.trailer_link} onChange={handleChange} className="dark-input" />
          </div>
          <div className="form-row">
            <label htmlFor="multiplayer" className="creategame-checkbox-label">
              <input id="multiplayer" type="checkbox" name="multiplayer" checked={formData.multiplayer} onChange={handleChange} className="creategame-checkbox" />
              {t("createGame.multiplayer")}
            </label>
          </div>
          {errors.submit && <span className="error">{errors.submit}</span>}
          {success && <span className="creategame-success">{success}</span>}
          <button type="submit" className="creategame-submit-btn" disabled={loading}>
            {loading ? t("createGame.submitting") : t("createGame.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GameForm;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
