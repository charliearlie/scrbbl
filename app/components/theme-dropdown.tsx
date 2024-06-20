import { useEffect, useState } from "react";
import { capitalise } from "~/utils";

// todo: put somewhere for the tailwind config to also use
const themes = ["light", "dark"];
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
        className="dropdown-content menu rounded-box bg-base-300 w-52 overflow-scroll p-2 shadow"
      >
        {themes.map((theme) => {
          return (
            <li>
              <button
                className={`p-2 ${
                  theme === currentTheme
                    ? "text-primary-content bg-primary"
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
