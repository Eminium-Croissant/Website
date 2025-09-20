import React, { Dispatch, SetStateAction, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";
import useIsMobile from "../../hooks/useIsMobile";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const endpoint = "/api"; // Replace with your actual API endpoint

const CreateItem = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    showInStore: false,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);

  const [errors, setErrors]: [any, Dispatch<SetStateAction<any>>] = useState(
    {}
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Ajouté

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const validate = () => {
      const newErrors: any = {};
      if (!formData.name) newErrors.name = t("createItem.error.name");
      if (!formData.description)
        newErrors.description = t("createItem.error.description");
      if (!formData.price) newErrors.price = t("createItem.error.price");
      // iconFile is now optional
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

    let iconHash = null;
    if (iconFile) {
      const iconData = new FormData();
      iconData.append("icon", iconFile);
      try {
        const res = await fetch("/upload/item-icon", {
          method: "POST",
          body: iconData,
        });
        if (res.ok) {
          const data = await res.json();
          iconHash = data.hash;
        } else {
          const err = await res.json();
            setErrors({ submit: err.error || t("createItem.error.iconUpload") });
          setLoading(false);
          return;
        }
      } catch (err: any) {
          setErrors({ submit: err.message || t("createItem.error.iconUpload") });
        setLoading(false);
        return;
      }
    }

    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      showInStore: formData.showInStore,
      ...(iconHash && { iconHash }),
    };

    try {
      const res = await fetch(endpoint + "/items/create", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
          setSuccess(t("createItem.success"));
        setFormData({
          name: "",
          description: "",
          price: "",
          showInStore: false,
        });
        setIconFile(null);
        // Redirection après succès
        router.push("/dev-zone/my-items");
        return;
      } else {
        const err = await res.json();
          setErrors({ submit: err.message || t("createItem.error.submit") });
      }
    } catch (err: any) {
        setErrors({ submit: err.message || t("createItem.error.submit") });
    } finally {
      setLoading(false);
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
          <h2 style={{ marginBottom: 10 }}>{t("createItem.mobile.title")}</h2>
          <p>{t("createItem.mobile.desc")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="createitem-container">
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/dev-zone/my-items"
            style={{
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              padding: "8px 16px",
              fontSize: "0.95rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
              &larr; {t("createItem.backToMyItems")}
          </Link>
        </div>
        <h1 className="createitem-title">
            <span>{t("createItem.title")}</span>
        </h1>
        <form onSubmit={handleSubmit} className="game-form">
          <div className="form-row">
              <label htmlFor="name">
                {t("createItem.name")} <span className="required">*</span>
              </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="dark-input"
            />
          </div>
          {errors.name && <span className="error">{errors.name}</span>}
          <div className="form-row">
              <label htmlFor="description">
                {t("createItem.description")} <span className="required">*</span>
              </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="dark-input"
            />
          </div>
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
          <div className="form-row">
              <label htmlFor="price">
                {t("createItem.price")} <span className="required">*</span>
              </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min={0}
              step="any"
              className="dark-input"
            />
          </div>
          {errors.price && <span className="error">{errors.price}</span>}
          <div className="form-row">
              <label htmlFor="showInStore" className="createitem-checkbox-label">
              <input
                id="showInStore"
                type="checkbox"
                name="showInStore"
                checked={formData.showInStore}
                onChange={handleChange}
                className="createitem-checkbox"
              />
                {t("createItem.showInStore")}
            </label>
          </div>
          <div className="form-row">
              <label htmlFor="icon">{t("createItem.icon")}</label>
            <label
              htmlFor="icon"
              className="custom-file-label createitem-file-label"
            >
                {iconFile ? t("createItem.changeIcon") : t("createItem.chooseIcon")}
              <input
                id="icon"
                type="file"
                accept="image/*"
                name="icon"
                onChange={handleIconChange}
                className="dark-input"
                style={{ display: "none" }}
              />
            </label>
            {iconFile && (
                <span className="createitem-ready">
                  {t("createItem.selected")}: {iconFile.name}
                </span>
            )}
          </div>
          {errors.submit && <span className="error">{errors.submit}</span>}
          {success && <span className="createitem-success">{success}</span>}
          <button
            type="submit"
            className="createitem-submit-btn"
            disabled={loading}
          >
          {loading ? t("createItem.submitting") : t("createItem.submit")}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateItem;

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
