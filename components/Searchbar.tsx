import { useTranslation } from "next-i18next";
import { useRouter } from "next/navigation";
import { ChangeEvent, KeyboardEvent, useState } from "react";

export default function Searchbar() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const query = encodeURIComponent(e.currentTarget.value);
      if (query) {
        router.push("/search?q=" + query);
      }
    }
  };

  return (
    <div className="relative">
      <input
        className="glass-input"
        placeholder={t("searchbar.placeholder")}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

