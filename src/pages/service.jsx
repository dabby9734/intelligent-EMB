import Head from "next/head";
import { useContext, useEffect } from "react";
import { navPrefsContext } from "./_app";
import Header from "../components/Header";
import MobileNavbar from "../components/MobileNavbar";
import DesktopNavbar from "../components/DesktopNavbar";
import Messages from "../components/Messages";

export default function ServiceBoard() {
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
        <title>iEMB</title>
        <meta name="description" content="i-EMB, reimagined." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <MobileNavbar />
      <div className="contentframe">
        <DesktopNavbar />
        <Messages boardID={1039} />
      </div>
    </>
  );
}
