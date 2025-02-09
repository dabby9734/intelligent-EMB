import Head from "next/head";
import { useContext, useEffect } from "react";
import { navPrefsContext } from "./_app";
import Header from "../components/Header";
import MobileNavbar from "../components/MobileNavbar";
import DesktopNavbar from "../components/DesktopNavbar";
import Messages from "../components/Messages";

export default function StudentBoard() {
  const ctx = useContext(navPrefsContext);
  useEffect(() => {
    try {
      let prefs = JSON.parse(localStorage.getItem("prefs"));
      ctx.setNavPrefs(prefs);
    } catch (e) {
      console.log(e);
    }
  }, []);
  useEffect(() => {
    if (!!ctx.navPrefs) {
      localStorage.setItem("prefs", JSON.stringify(ctx.navPrefs));
    }
  }, [ctx.navPrefs]);

  return (
    <>
      <Head>
        <title>iEMB :: Student</title>
      </Head>

      <Header />
      <MobileNavbar />
      <div className="contentframe">
        <DesktopNavbar />
        <Messages boardID={1048} />
      </div>
    </>
  );
}
