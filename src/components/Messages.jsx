import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { Box, Pagination, useTheme, IconButton } from "@mui/material";
import { checkCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";
import MessageSkeleton from "./MessageCardSkeleton";
import { navPrefsContext, notifContext } from "../pages/_app";
import ScrollToTopFab from "./ScrollToTopFab";
import MessageCard from "./MessageCard";
import { getApiURL } from "../lib/util";
import PostFrame from "./PostFrame";
import CloseIcon from "@mui/icons-material/Close";

const fetchMessages = async (type, boardID, page = 1) => {
  if (
    !checkCookie("auth_token") ||
    !checkCookie("sess_id") ||
    !checkCookie("veri_token")
  ) {
    return -2;
  }

  let endpoint = "getBoard";
  let url = new URL(getApiURL(endpoint));
  switch (type) {
    case "updated-messages":
      url.searchParams.append("isupdated", "True");
      url.searchParams.append("t", "1");
      break;
    case "my-messages":
      url.searchParams.append("postBy", localStorage.getItem("name"));
      url.searchParams.append("t", "2");
      break;
    case "my-drafts":
      url.searchParams.append("t", "3");
      break;
    case "starred":
      endpoint = "getBoardStarred";
      url = new URL(getApiURL("getBoardStarred"));
      break;
    case "archived":
      url = new URL(getApiURL("getBoardArchived"));
      url.searchParams.append("page", page);
      break;
  }
  url.searchParams.append("boardID", boardID);
  const response = await fetch(url).catch((err) => {
    return -1;
  });

  switch (response.status) {
    case 401:
      return -2;
    case 200:
      break;
    default:
      // also handles response code 500
      return -1;
  }

  const data = await response.json();
  return data;
};

const Messages = ({ boardID }) => {
  // essentials
  const router = useRouter();
  const theme = useTheme();
  const ctx = useContext(navPrefsContext);
  const notif = useContext(notifContext);

  // Control message display
  const [messages, setMessages] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fav, setFav] = useState("");
  const { type } = router.query;

  const getSortedMessages = (messages) => {
    messages?.sort((a, b) => (a.pid < b.pid ? 1 : -1));
    // sort by pid
    // Fun fact: because iemb doesn't do this their messages are sorted correctly by date but not by time

    messages = messages?.filter(
      (message) =>
        ctx.navPrefs?.messagePrefs.indexOf(message.urgency) !== -1 ||
        // remove messages not of desired urgency
        message.read === null
    );

    if (ctx.navPrefs?.messagePrefs.indexOf("Read") === -1) {
      // remove messages read already
      messages = messages?.filter((message) => {
        if (message.read === null) {
          return true;
        } else return !message.read;
      });
    }

    if (ctx.navPrefs?.messagePrefs.indexOf("ECG") === -1) {
      // remove messages pertaining to ECG
      messages = messages?.filter(
        (message) => message.subject.indexOf("ECG") === -1
      );
    }

    return messages;
  };

  // initiates fetching messages
  useEffect(() => {
    async function fetchData() {
      if (!type) return;
      // update UI with cached messages
      try {
        setMessages(JSON.parse(localStorage.getItem(`${boardID}+${type}`)));
      } catch (err) {
        console.log(err);
      }
      try {
        setFav(JSON.parse(localStorage.getItem(`${boardID}+starred`)));
      } catch (err) {
        console.log(err);
      }

      // fetch fresh messages
      const data = await fetchMessages(type, boardID, page);
      // handle error
      if (data === -1) return notif.open("Error fetching messages");
      if (data === -2)
        return await refreshToken(
          async () => fetchMessages(type, boardID, page),
          notif.open
        );
      // add messages to localStorage
      localStorage.setItem(`${boardID}+${type}`, JSON.stringify(data.messages));
      // add user's name to localStorage
      if (data.name) localStorage.setItem("name", data.name);
      // pagination data for archived and starred boards
      if (type === "archived" || type === "starred") {
        setPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
      // update UI with fresh messages
      setMessages(data.messages);
      notif.open("Messages fetched");
      // fetch starred messages (to update star icon)
      if (type !== "starred") {
        fetchMessages("starred", boardID).then((data) => {
          setFav(data.messages);
        });
      }
    }
    fetchData();
  }, [type]);

  // fetches messages again if the user navigates to a different page
  // for archived and starred board only
  useEffect(() => {
    async function fetchData() {
      if (router.query.type === "archived" || router.query.type === "starred") {
        setMessages("");
        // fetch fresh messages
        const data = fetchMessages(type, boardID, page);
        // handle error
        if (data === -1) return notif.open("Error fetching messages");
        if (data === -2)
          return await refreshToken(
            async () => fetchMessages(type),
            boardID,
            page
          );
        // update UI with fresh messages
        setMessages(data.messages);
        setPage(data.currentPage);
        setTotalPages(data.totalPages);
        notif.open("Messages fetched");
      }
    }
    fetchData();
  }, [page]);

  // toggles loading state
  useEffect(() => {
    setLoading(!messages);
  }, [messages]);

  const [previewPid, setPreviewPid] = useState("");
  useEffect(() => {
    let box = document.querySelector(".preview-frame");
    if (box === null) return;

    box.style.transition = "all 0.3s ease-in-out";
    box.style.transform = previewPid ? `translateX(0)` : `translateX(100%)`;
    box.style.opacity = previewPid ? 1 : 0;
    box.style.flex = previewPid ? 1.5 : 0;
  }, [previewPid]);

  return (
    <>
      <Box
        className="contentframe"
        sx={{
          backgroundColor: theme.palette.background.default,
          flex: "1",
        }}
      >
        {loading ? (
          new Array(20).fill(0).map((_, i) => <MessageSkeleton key={i} />)
        ) : (
          <>
            <Box className="messages" id="messages">
              {(!messages || messages.length === 0) && (
                <h2
                  style={{
                    color: theme.palette.text.primary,
                  }}
                >
                  No messages
                </h2>
              )}
              {!!messages &&
                getSortedMessages(messages)?.map((message) => (
                  <MessageCard
                    key={message.pid}
                    message={message}
                    fav={fav}
                    setFav={setFav}
                    messages={messages}
                    boardtype={type}
                    setPreviewPid={setPreviewPid}
                  />
                ))}
              {!!messages &&
                (router.query.type === "archived" ||
                  router.query.type === "starred") && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingTop: "1rem",
                    }}
                  >
                    <Pagination
                      color="primary"
                      count={totalPages}
                      page={page}
                      onChange={(e, page) => {
                        setPage(page);
                      }}
                    />
                  </div>
                )}
              <ScrollToTopFab />
            </Box>
          </>
        )}
      </Box>
      <div
        className="preview-frame desktop-only"
        style={{
          borderLeft: `1px solid ${theme.palette.divider}`,
          overflowY: "auto",
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: 10,
            right: 20,
          }}
          onClick={() => setPreviewPid("")}
        >
          <CloseIcon />
        </IconButton>
        <PostFrame boardID={boardID} pid={previewPid} type={type} />
      </div>
    </>
  );
};

export default Messages;
