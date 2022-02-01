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
  const { type } = router.query;

  const fetchMessages = async (type) => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken(fetchMessages, setInfo, router);
    }

    let endpoint = "getBoard";
    let extraArgs = "";
    switch (type) {
      case "updated-messages":
        extraArgs = "&isupdated=True&t=1";
        break;
      case "my-messages":
        extraArgs = `&postBy=${encodeURIComponent(
          localStorage.getItem("name")
        )}&t=2`;
        break;
      case "my-drafts":
        extraArgs = "&t=3";
        break;
      case "starred":
        endpoint = "getBoardStarred";
        break;
      case "archived":
        endpoint = "getBoardArchived";
        break;
      default:
        endpoint = "getBoard";
    }
    const url = `https://iemb-backend.azurewebsites.net/api/${endpoint}?authToken=${encodeURI(
      getCookie("auth_token")
    )}&veriToken=${encodeURI(getCookie("veri_token"))}&sessionID=${encodeURI(
      getCookie("sess_id")
    )}&boardID=${1048}${extraArgs}`;
    const response = await fetch(url);

    const data = await response.json();

    if (!data.success) {
      setInfo(data.message);

      if (data.message === "Needs to refresh token") {
        return await refreshToken(fetchMessages, setInfo, router);
      } else return;
    }

    // add data to localStorage
    localStorage.setItem(`studentBoard+${type}`, JSON.stringify(data.messages));
    if (data.name) {
      localStorage.setItem("name", data.name);
    }
    setMessages(data.messages);
    setInfo("Messages fetched");
    setLoading(false);
  };

  useEffect(() => {
    if (type) {
      try {
        setMessages(JSON.parse(localStorage.getItem(`studentBoard+${type}`)));
      } catch (err) {
        console.log(err);
      }

      fetchMessages(type);
    }
  }, [type]);

  useEffect(() => {
    if (!!messages) setLoading(false);
  }, [messages]);

  return (
    <>
      <Head>
        <title>iEMB</title>
        <meta
          name="description"
          content="Fighting HCI IT Department's anticompetitive behaviours"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Snackbar
        open={!!info}
        autoHideDuration={5000}
        onClose={() => setInfo("")}
      >
        <Alert severity="info" onClose={() => setInfo("")}>
          {info}
        </Alert>
      </Snackbar>

      <Navbar />
      <div className="contentframe">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Messages messages={messages} boardID={1048} />
        )}
      </div>
    </>
  );
}
