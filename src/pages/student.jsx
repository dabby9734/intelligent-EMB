import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getCookie, checkCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";

import Navbar from "../components/Navbar";
import { Snackbar, Alert } from "@mui/material";
import Messages from "../components/Messages";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const [messages, setMessages] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMessages = async () => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken(fetchMessages, setInfo, router);
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
        return await refreshToken(fetchMessages, setInfo, router);
      } else return;
    }

    // add data to localStorage
    localStorage.setItem("studentBoard", JSON.stringify(data.messages));
    if (data.name) {
      localStorage.setItem("name", data.name);
    }
    setMessages(data.messages);
    setInfo("Messages fetched");
    setLoading(false);
  };

  useEffect(() => {
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
