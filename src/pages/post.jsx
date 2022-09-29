import Head from "next/head";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, useTheme } from "@mui/material";

import { getCookie, setCookie, deleteCookie } from "../lib/cookieMonster";
import { notifContext } from "./_app";

import Header from "../components/Header";
import MobileNavbar from "../components/MobileNavbar";
import DesktopNavbar from "../components/DesktopNavbar";
import PostContent from "../components/PostContent";
import PostInfo from "../components/PostInfo";
import PostReply from "../components/PostReply";
import { getApiURL } from "../lib/util";

const Post = () => {
  const router = useRouter();
  const { pid, boardID, type } = router.query;
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [details, setDetails] = useState({});
  const [replyInfo, setReplyInfo] = useState({ canReply: false });
  const notif = useContext(notifContext);

  const refreshToken = async () => {
    const response = await fetch(
      `${getApiURL("login")}&username=${encodeURIComponent(
        getCookie("username")
      )}&password=${encodeURIComponent(getCookie("password"))}`
    );

    switch (response.status) {
      case 200:
        break;
      default:
        notif.open("Token refresh failed");
        deleteCookie("username");
        deleteCookie("password");
        deleteCookie("auth_token");
        deleteCookie("sess_id");
        deleteCookie("veri_token");
        localStorage.clear();
        router.push("/" + "?next=" + encodeURIComponent(router.asPath));
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
      if (data.message === "Missing username and/or password") {
        deleteCookie("username");
        deleteCookie("password");
        deleteCookie("auth_token");
        deleteCookie("sess_id");
        deleteCookie("veri_token");
        localStorage.clear();
        router.push("/" + "?next=" + encodeURIComponent(router.asPath));
      }

      notif.open(data.message);
      setPostLoading(false);
      setContent(`<h2>${data.message}</h2>`);
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
    const url = `${getApiURL("getPost")}&pid=${pid}&boardID=${boardID}`;
    const response = await fetch(url).catch((err) => {
      return notif.open("An error occured while fetching messages");
    });

    switch (response.status) {
      case 401:
        return await refreshToken();
      case 200:
        break;
      default:
        // also handles response code 500
        setPostLoading(false);
        setContent(`<h2>An error occured while fetching messages</h2>`);
        return notif.open("An error occured while fetching messages");
    }

    const data = await response.json();

    if (!data.success) {
      switch (data.message) {
        case "Need to refresh token":
          notif.open(data.message);
          return await refreshToken();
        case "Invalid username or password":
          deleteCookie("username");
          deleteCookie("password");
          deleteCookie("auth_token");
          deleteCookie("sess_id");
          deleteCookie("veri_token");
          localStorage.clear();
          return router.push(
            "/" + "?next=" + encodeURIComponent(router.asPath)
          );
        default:
          setPostLoading(false);
          notif.open(data.message);
          setContent(`<h2>${data.message}</h2>`);
      }
    }

    try {
      let b = JSON.parse(localStorage.getItem(`${boardID}+${type}`));
      b.forEach((post) => {
        if (post.pid === pid) {
          post.read = true;
        }
      });
      localStorage.setItem(`${boardID}+${type}`, JSON.stringify(b));
    } catch (err) {
      console.log(err);
    }
    setDetails(data.postInfo);
    setReplyInfo(data.postReply);
    setContent(data.post);
    setAttachments(data.attachments);

    setPostLoading(false);
    notif.open(`Post ${pid} fetched`);
  };
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    // https://nextjs.org/docs/routing/dynamic-routes
    // Pages that are statically optimized by Automatic Static Optimization will be hydrated without their route parameters provided, i.e query will be an empty object ({}).
    // After hydration, Next.js will trigger an update to your application to provide the route parameters in the query object.
    if (router.query.pid && router.query.boardID) {
      fetchPost(pid, boardID);
    }
  }, [router.query]);

  const theme = useTheme();

  return (
    <>
      <Head>
        <title>iEMB :: Post {pid}</title>
        <meta name="description" content="i-EMB, reimagined." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <MobileNavbar />
      <div style={{ display: "flex" }}>
        <DesktopNavbar />
        <Box
          className="contentframe"
          sx={{ backgroundColor: theme.palette.background.default }}
        >
          {postLoading ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <PostInfo info={details} />
              <PostContent attachments={attachments} content={content} />
              <PostReply info={replyInfo} pid={pid} boardID={boardID} />
            </>
          )}
        </Box>
      </div>
    </>
  );
};

export default Post;
