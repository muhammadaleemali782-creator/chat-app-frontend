import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);
const THEME_ORDER = ["dark", "light", "blue", "white"];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("theme");
    return THEME_ORDER.includes(saved) ? saved : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (t) => {
    if (THEME_ORDER.includes(t)) setThemeState(t);
  };

  // Button click pe agle theme pe cycle karo: dark -> light -> blue -> white -> dark
  const toggleTheme = () => {
    setThemeState((t) => {
      const idx = THEME_ORDER.indexOf(t);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEME_ORDER }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
