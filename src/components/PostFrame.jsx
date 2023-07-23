import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { deleteCookie, getCookie, setCookie } from "../lib/cookieMonster";
import { getApiURL } from "../lib/util";
import { refreshToken } from "../lib/browserMonster";
import { notifContext } from "../pages/_app";

import PostContent from "./PostContent";
import PostInfo from "./PostInfo";
import PostReply from "./PostReply";
import { Box, CircularProgress } from "@mui/material";

const PostFrame = ({ boardID, pid, type }) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [details, setDetails] = useState({});
  const [replyInfo, setReplyInfo] = useState({ canReply: false });
  const notif = useContext(notifContext);

  const fetchPost = async (pid, boardID) => {
    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken(() => fetchPost(pid, boardID), notif.open);
    }
    let url = new URL(getApiURL("getPost"));
    url.searchParams.append("pid", pid);
    url.searchParams.append("boardID", boardID);
    const response = await fetch(url).catch((err) => {
      setPostLoading(false);
      setContent(`<h2>${err}</h2>`);
      return notif.open("An error occured while fetching messages");
    });

    switch (response.status) {
      case 401:
        return await refreshToken(() => fetchPost(pid, boardID), notif.open);
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
    if (pid && boardID) {
      setPostLoading(true);
      fetchPost(pid, boardID);
    }
  }, [pid, boardID]);

  return postLoading ? (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ padding: "1rem" }}>
      <PostInfo
        info={details}
        urlPath={`/post?boardID=${boardID}&pid=${pid}`}
      />
      <PostContent attachments={attachments} content={content} />
      <PostReply info={replyInfo} pid={pid} boardID={boardID} />
    </Box>
  );
};

export default PostFrame;
