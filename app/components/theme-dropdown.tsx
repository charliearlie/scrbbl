import { useEffect, useState } from "react";
import { capitalise } from "~/utils";

// todo: put somewhere for the tailwind config to also use
const themes = [
  "light",
  "dark",
  "aqua",
  "black",
  "cupcake",
  "dracula",
  "emerald",
  "fantasy",
  "forest",
  "night",
];
export default function ThemeDropdown() {
  const [currentTheme, setCurrentTheme] = useState("");

  useEffect(() => {
    const html = document.querySelector("html");
    setCurrentTheme(html?.dataset.theme || "");
  }, []);

  useEffect(() => {}, [currentTheme]);

  return (
    <div className="dropdown-left dropdown">
      <label tabIndex={0} className="btn m-1">
        {currentTheme}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 overflow-scroll bg-base-300 p-2 shadow"
      >
        {themes.map((theme) => {
          return (
            <li>
              <button
                className={`p-2 ${
                  theme === currentTheme
                    ? "bg-primary text-primary-content"
                    : ""
                }`}
                data-set-theme={theme}
                data-act-class="ACTIVECLASS"
                onClick={() => setCurrentTheme(theme)}
              >
                {capitalise(theme)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
