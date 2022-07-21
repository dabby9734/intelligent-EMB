import "../styles/main.scss";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Alert, Snackbar } from "@mui/material";
import { useMediaQuery } from "@mui/material";

import React, { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState(prefersDarkMode ? "dark" : "light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: (newMode) => {
        setMode(newMode);
        localStorage.setItem("mode", newMode);
        // set data theme attribute of html tag
        document.documentElement.setAttribute("data-theme", newMode);
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
          background: {
            default: mode === "dark" ? "#1c1c1c" : "#f8f8ff",
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
      document.documentElement.setAttribute("data-theme", mode);
    }
  }, []);

  const [navPrefs, setNavPrefs] = React.useState({
    desktopNavOpen: true,
    mobileNavOpen: false,
    messagePrefs: ["Urgent", "Important", "Information", "Read"],
  });

  useEffect(() => {
    if (navPrefs === null) {
      setNavPrefs({
        desktopNavOpen: true,
        mobileNavOpen: false,
        messagePrefs: ["Urgent", "Important", "Information", "Read"],
      });
    }
  }, [navPrefs]);

  const [notif, setNotif] = React.useState({
    severity: "info",
    message: "",
    close: () =>
      setNotif({
        ...notif,
        severity: "info",
        message: "",
      }),
    open: (message, severity = "info") =>
      setNotif({
        ...notif,
        severity,
        message,
      }),
  });

  return (
    <notifContext.Provider value={notif}>
      <navPrefsContext.Provider value={{ navPrefs, setNavPrefs }}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <Snackbar
              open={!!notif.message}
              autoHideDuration={1000}
              onClose={notif.close}
            >
              <Alert severity={notif.severity} onClose={notif.close}>
                {notif.message}
              </Alert>
            </Snackbar>
            <Component {...pageProps} />
          </ThemeProvider>
        </ColorModeContext.Provider>
      </navPrefsContext.Provider>
    </notifContext.Provider>
  );
}

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});
export const navPrefsContext = React.createContext();
export const notifContext = React.createContext();
export default MyApp;
