import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

import { getCookie } from "../lib/cookieMonster";

import Login from "../components/Login";
import { Button } from "@mui/material";

export default function Home() {
  const fetchMessages = async () => {
    const response = await fetch("/api/getStudentBoard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        veriTokenCookie: getCookie("veri_token"),
        authToken: getCookie("auth_token"),
        sessionID: getCookie("sess_id"),
      }),
    });
    const data = await response.json();
    // add data to localStorage
    localStorage.setItem("studentBoard", JSON.stringify(data.messages));
    setL(true);
  };

  const getMessagesFromLocalStorage = () => {
    const studentBoard = JSON.parse(localStorage.getItem("studentBoard"));
    console.log(studentBoard);
    return studentBoard;
  };

  const getUnread = () => {
    return (
      <div>
        <h2>unReAd mEssAgEs</h2>
        {getMessagesFromLocalStorage().unread.length
          ? getMessagesFromLocalStorage().unread.map((m) => (
              <div key={m}>
                <div>{m.date}</div>
                <div>{m.sender}</div>
                <div>{m.username}</div>
                <div>{m.subject}</div>
                <div>{m.url}</div>
                <div>{m.urgency}</div>
                <div>{m.recipient}</div>
                <div>{m.viewCount}</div>
                <div>{m.replyCount}</div>
                <div>-----------------------------------</div>
              </div>
            ))
          : "no messages u suck"}
      </div>
    );
  };

  const getRead = () => {
    return (
      <div>
        <h2>rEaD mesSagES</h2>
        {getMessagesFromLocalStorage().read.length
          ? getMessagesFromLocalStorage().read.map((m) => (
              <div key={m}>
                <div>{m.date}</div>
                <div>{m.sender}</div>
                <div>{m.username}</div>
                <div>{m.subject}</div>
                <div>{m.url}</div>
                <div>{m.urgency}</div>
                <div>{m.recipient}</div>
                <div>{m.viewCount}</div>
                <div>{m.replyCount}</div>
                <div>-----------------------------------</div>
              </div>
            ))
          : "no messages u suck"}
      </div>
    );
  };

  const [l, setL] = useState(false);

  return (
    <div>
      <Head>
        <title>iEMB-Z</title>
        <meta
          name="description"
          content="Fighting iemb's anticompetitive behaviours"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <Login />
        <h3>
          u cant sign out so just wait for session to time out :) FUNNY MEME
          BELOW 👇👇👇👇
        </h3>
        <Image
          src="https://cdn.discordapp.com/attachments/692997415443234846/889874878348546058/image0.png"
          width={508}
          height={429}
          alt="funni meme"
        />
        <Button variant="contained" onClick={fetchMessages}>
          Fetch messages LOL
        </Button>
        <h1>
          internal iemb client ( do not distribute) (will cause crying cause of
          bad ui)
        </h1>
        {typeof window !== "undefined" && localStorage.getItem("studentBoard") && (
          <div>
            {getUnread()}
            {getRead()}
          </div>
        )}
      </div>
    </div>
  );
}
