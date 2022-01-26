import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getCookie, setCookie, checkCookie } from "../lib/cookieMonster";

import Navbar from "../components/Navbar";
import { Snackbar, Alert, Stack } from "@mui/material";
import Messages from "../components/Messages";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const [messages, setMessages] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshToken = async () => {
    const response = await fetch(
      `https://iemb-backend.azurewebsites.net/api/login?username=${encodeURI(
        getCookie("username")
      )}&password=${encodeURI(getCookie("password"))}`
    );

    if (response.status != 200) {
      return setInfo("Token refresh failed");
    }

    const data = await response.json();

    if (data.success) {
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

      setInfo("Token refreshed");
      return await fetchMessages();
    } else {
      setInfo(data.message);
    }
  };

  const fetchMessages = async () => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken();
    }
    const url = `https://iemb-backend.azurewebsites.net/api/getBoard?authToken=${encodeURI(
      getCookie("auth_token")
    )}&veriToken=${encodeURI(getCookie("veri_token"))}&sessionID=${encodeURI(
      getCookie("sess_id")
    )}&boardID=${1048}`;
    const response = await fetch(url);

    const data = await response.json();

    if (!data.success) {
      setInfo(data.message);

      if (data.message === "Needs to refresh token") {
        return await refreshToken();
      } else return;
    }

    // add data to localStorage
    localStorage.setItem("studentBoard", JSON.stringify(data.messages));
    setMessages(data.messages);
    setInfo("Messages fetched");
    setLoading(false);
  };

  useEffect(() => {
    if (!getCookie("username") || !getCookie("password")) {
      router.push("/");
    }

    try {
      setMessages(JSON.parse(localStorage.getItem("studentBoard")));
    } catch (err) {
      console.log(err);
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    if (!!messages) setLoading(false);
  }, [messages]);

  return (
    <div>
      <Head>
        <title>iEMB</title>
        <meta
          name="description"
          content="Fighting HCI IT Department's anticompetitive behaviours"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <Snackbar
          open={!!info}
          autoHideDuration={5000}
          onClose={() => setInfo("")}
        >
          <Alert severity="info" onClose={() => setInfo("")}>
            {info}
          </Alert>
        </Snackbar>
        <div className="pageframe">
          <Navbar />
          <div className="contentframe">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Messages messages={messages} boardID={1048} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
