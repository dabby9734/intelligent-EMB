import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Stack, Snackbar, Alert } from "@mui/material";

import { getCookie, setCookie } from "../../lib/cookieMonster";

import Navbar from "../../components/Navbar";
import PostContent from "../../components/PostContent";
import LoadingSpinner from "../../components/LoadingSpinner";

const Post = () => {
  const router = useRouter();
  const { pid, boardID } = router.query;
  const [attachments, setAttachments] = useState([]);

  const refreshToken = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: getCookie("username"),
        password: getCookie("password"),
      }),
    });

    if (response.status != 200) {
      return setInfo("Token refresh failed");
    }

    const data = await response.json();

    if (data.success) {
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

      // You might think it's better to do `return await fetchPost()` here, but
      // iemb.hci.edu.sg likes to throw a HTTP status code 500 if you do that.
      // I have no idea why it does that, just like I have no idea how this
      // seems to work much more reliably...
      router.reload();
    } else {
      setInfo(data.message);
      setPostLoading(false);
      document.querySelector(
        ".post-content"
      ).innerHTML = `<h2>${data.message}</h2>`;
    }
  };

  const fetchPost = async (pid, boardID) => {
    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken();
    }
    const response = await fetch("/api/getPostWithAttachmentURL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        veriTokenCookie: getCookie("veri_token"),
        authToken: getCookie("auth_token"),
        sessionID: getCookie("sess_id"),
        pid: pid,
        boardID: boardID,
      }),
    });

    if (response.status != 200) {
      setInfo("Cannot fetch post");
    }

    const data = await response.json();

    if (!data.success) {
      setInfo(data.message);

      if (data.message === "Needs to refresh token") {
        return await refreshToken();
      } else {
        setPostLoading(false);
        document.querySelector(
          ".post-content"
        ).innerHTML = `<h2>${data.message}</h2>`;
        return;
      }
    }

    setPostLoading(false);
    document.querySelector(".post-content").innerHTML = data.post;
    setAttachments(data.attachments);

    setInfo(`Post ${pid} fetched`);
  };

  const [info, setInfo] = useState("");
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    // https://nextjs.org/docs/routing/dynamic-routes
    // Pages that are statically optimized by Automatic Static Optimization will be hydrated without their route parameters provided, i.e query will be an empty object ({}).
    // After hydration, Next.js will trigger an update to your application to provide the route parameters in the query object.
    if (router.query.pid && router.query.boardID) {
      if (!getCookie("username") || !getCookie("password")) {
        router.push("/");
      } else {
        fetchPost(pid, boardID);
      }
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>iEMB :: {pid}</title>
        <meta
          name="description"
          content="Fighting iemb's anticompetitive behaviours"
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
      <div className="pageframe">
        <Navbar />
        <div className="contentframe">
          {postLoading ? (
            <LoadingSpinner />
          ) : (
            <PostContent attachments={attachments} setInfo={setInfo} />
          )}
        </div>
      </div>
    </>
  );
};

export default Post;
