import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { Box, Pagination, useTheme, IconButton } from "@mui/material";
import { checkCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";
import MessageSkeleton from "./MessageSkeleton";
import { navPrefsContext, notifContext } from "../pages/_app";
import ScrollToTopFab from "./ScrollToTopFab";
import MessageCard from "./MessageCard";
import { getApiURL } from "../lib/util";
import PostFrame from "./PostFrame";
import CloseIcon from "@mui/icons-material/Close";

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

  const fetchMessages = async (type, setM = true) => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken(
        async () => fetchMessages(type, setM),
        notif.open,
        router
      );
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
        extraArgs = `&page=${page}`;
        break;
      default:
        endpoint = "getBoard";
    }
    const url = `${getApiURL(endpoint)}&boardID=${boardID}${extraArgs}`;
    const response = await fetch(url).catch((err) => {
      return notif.open("An error occured while fetching messages");
    });

    switch (response.status) {
      case 401:
        return await refreshToken(
          async () => fetchMessages(type, setM),
          notif.open,
          router
        );
      case 200:
        break;
      default:
        // also handles response code 500
        return notif.open("An error occured while fetching messages");
    }

    const data = await response.json();

    // add messages to localStorage
    localStorage.setItem(`${boardID}+${type}`, JSON.stringify(data.messages));
    // add user's name to localStorage
    if (data.name) {
      localStorage.setItem("name", data.name);
    }
    // pagination data for archived and starred boards
    if (type === "archived" || type === "starred") {
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
    }
    if (setM) {
      setMessages(data.messages);
      notif.open("Messages fetched");
    }
    if (type === "starred") {
      setFav(data.messages);
    }
  };
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
      if (type) {
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

        if (type !== "starred") {
          await Promise.all([
            fetchMessages(type),
            fetchMessages("starred", false),
          ]);
        } else {
          // for starred board
          await fetchMessages(type);
        }
      }
    }
    fetchData();
  }, [type]);

  // fetches messages again if the user navigates to a different page
  // for archived and starred board only
  useEffect(() => {
    if (router.query.type === "archived" || router.query.type === "starred") {
      setMessages("");
      fetchMessages(router.query.type, page);
    }
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
              {previewPid || <ScrollToTopFab />}
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
