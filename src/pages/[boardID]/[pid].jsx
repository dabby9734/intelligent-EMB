import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Stack, Snackbar, Alert } from "@mui/material";

import { getCookie, setCookie } from "../../lib/cookieMonster";

import Navbar from "../../components/Navbar";
import PostContent from "../../components/PostContent";
import PostInfo from "../../components/PostInfo";
import LoadingSpinner from "../../components/LoadingSpinner";
import PostReply from "../../components/PostReply";

const Post = () => {
  const router = useRouter();
  const { pid, boardID } = router.query;
  const [attachments, setAttachments] = useState([]);
  const [details, setDetails] = useState({});
  const [replyInfo, setReplyInfo] = useState({ canReply: false });

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
    const url = `https://iemb-backend.azurewebsites.net/api/getPost?authToken=${encodeURI(
      getCookie("auth_token")
    )}&veriToken=${encodeURI(getCookie("veri_token"))}&sessionID=${encodeURI(
      getCookie("sess_id")
    )}&pid=${pid}&boardID=${boardID}`;
    const response = await fetch(url);

    if (response.status != 200) {
      setInfo("Cannot fetch post");
    }

    const data = await response.json();

    if (!data.success) {
      setInfo(data.message);

      if (data.message === "Needs to refresh token") {
        return await refreshToken();
      }
      if (data.message === "Invalid username or password") {
        router.push("/");
      } else {
        setPostLoading(false);
        document.querySelector(
          ".post-content"
        ).innerHTML = `<h2>${data.message}</h2>`;
        return;
      }
    }

    setDetails(data.postInfo);
    setReplyInfo(data.postReply);
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
            <>
              <PostInfo info={details} />
              <PostContent attachments={attachments} setInfo={setInfo} />
              <PostReply
                info={replyInfo}
                pid={pid}
                boardID={boardID}
                setInfo={setInfo}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Post;
