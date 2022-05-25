import "../styles/main.scss";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

import React from "react";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

function MyApp({ Component, pageProps }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState(prefersDarkMode ? "dark" : "light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: (newMode) => {
        setMode(newMode);
        localStorage.setItem("mode", newMode);
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#ce9eff",
          },
        },
      }),
    [mode]
  );

  React.useEffect(() => {
    const mode = localStorage.getItem("mode");
    // set mode if it is valid
    if (mode === "dark" || mode === "light") {
      setMode(mode);
    }
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default MyApp;
