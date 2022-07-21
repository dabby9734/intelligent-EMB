import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { Box, Card, Fab, Zoom, Pagination, useTheme } from "@mui/material";
import { getCookie, checkCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MessageSkeleton from "./MessageSkeleton";
import { navPrefsContext, notifContext } from "../pages/_app";

const colors = {
  Information: "#4caf50",
  Important: "#ff9800",
  Urgent: "#f44336",
};

const getTimePassed = (date) => {
  // return one-seven days ago else the date
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 1) {
    return "Today";
  } else if (days < 2) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date;
  }
};

const Messages = ({ boardID }) => {
  const router = useRouter();

  // Control visibility floating action button to go back up
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    document.querySelector(".contentframe").addEventListener("scroll", (e) => {
      listenToScroll(e);
    });
    return () =>
      document
        .querySelector(".contentframe")
        .removeEventListener("scroll", (e) => {
          listenToScroll(e);
        });
  }, []);
  const listenToScroll = (e) => {
    if (e.target.scrollTop > 200) {
      setIsVisible(true);
    } else setIsVisible(false);
  };

  // Control message display
  const [messages, setMessages] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { type } = router.query;

  const fetchMessages = async (type) => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken(
        async () => fetchMessages(type),
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
    const url = `https://iemb-backend.azurewebsites.net/api/${endpoint}?authToken=${encodeURI(
      getCookie("auth_token")
    )}&veriToken=${encodeURI(getCookie("veri_token"))}&sessionID=${encodeURI(
      getCookie("sess_id")
    )}&boardID=${boardID}${extraArgs}`;
    const response = await fetch(url).catch((err) => {
      return notif.open("An error occured while fetching messages");
    });

    switch (response.status) {
      case 401:
        return await refreshToken(
          async () => fetchMessages(type),
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

    // add data to localStorage
    localStorage.setItem(`${boardID}+${type}`, JSON.stringify(data.messages));
    if (data.name) {
      localStorage.setItem("name", data.name);
    }
    if (type === "archived" || type === "starred") {
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
    }

    setMessages(data.messages);
    notif.open("Messages fetched");
    setLoading(false);
  };

  // initiates fetching messages
  useEffect(async () => {
    if (type) {
      try {
        setMessages(JSON.parse(localStorage.getItem(`${boardID}+${type}`)));
      } catch (err) {
        console.log(err);
      }

      fetchMessages(type);
    }
  }, [type]);

  // toggles the loading spinner
  useEffect(() => {
    if (!!messages) setLoading(false);
  }, [messages]);

  // fetches messages again if the user navigates to a different board
  // for archived and starred board only
  useEffect(() => {
    if (router.query.type === "archived" || router.query.type === "starred") {
      setMessages("");
      setLoading(true);
      fetchMessages(router.query.type, page);
    }
  }, [page]);

  const theme = useTheme();
  const ctx = useContext(navPrefsContext);
  const notif = useContext(notifContext);

  return (
    <Box
      className="contentframe"
      sx={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      {loading ? (
        new Array(20).fill(0).map((_, i) => <MessageSkeleton key={i} />)
      ) : (
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
            messages
              ?.sort((a, b) => (a.pid < b.pid ? 1 : -1))
              // sort by pid
              // Fun fact: because iemb doesn't do this their messages are sorted correctly by date but not by time
              ?.filter(
                (message) =>
                  ctx.navPrefs?.messagePrefs.indexOf(message.urgency) !== -1 ||
                  message.read === null
              )
              ?.filter((message) => {
                if (message.read === null) {
                  return true;
                }
                if (
                  ctx.navPrefs?.messagePrefs.indexOf("Read") === -1 &&
                  message.read
                ) {
                  // don't include the read messages
                  return false;
                } else {
                  return true;
                }
              })
              ?.map((message) => (
                <div className="messages__item" key={message.pid}>
                  <Card
                    variant="outlined"
                    className={`messages__item__content ${
                      message.read ? "read-msg" : "unread-msg"
                    }`}
                    sx={{
                      borderLeft: `5px solid ${
                        colors[message.urgency]
                          ? colors[message.urgency]
                          : "#ce9eff"
                      }`,
                      backgroundColor: theme.palette.background.paper,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                    }}
                  >
                    <a
                      href={`/post?boardID=${boardID}&pid=${message.pid}&type=${type}`}
                    >
                      <h2 className="messages__item__content__subject">
                        {message.subject}
                      </h2>
                      <div className="messages__item__content__info-wrapper">
                        <div className="messages__item__content__info-item">
                          <span className="messages__item__content__info-item-icon">
                            <PersonIcon fontSize="small" />
                          </span>
                          <span className="messages__item__content__info-item-field">
                            {message.username
                              ? message.username
                              : message.sender}
                          </span>
                        </div>
                        {/* <div className="messages__item__content__info-item">
                    <span className="messages__item__content__info-item-icon">
                      <GroupIcon fontSize="small" />
                    </span>
                    <span className="messages__item__content__info-item-field">
                      {message.recipient}
                    </span>
                  </div> */}
                        <div className="messages__item__content__info-item">
                          <span className="messages__item__content__info-item-icon">
                            <EventIcon fontSize="small" />
                          </span>
                          <span className="messages__item__content__info-item-field">
                            {getTimePassed(message.date)}
                          </span>
                        </div>
                      </div>
                    </a>
                  </Card>
                </div>
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
          <Zoom in={isVisible} timeout={300}>
            <Fab
              size="medium"
              color="secondary"
              aria-label="back-to-top"
              sx={{
                margin: 0,
                top: "auto",
                right: "2rem",
                bottom: "3.2rem",
                left: "auto",
                position: "fixed",
                backgroundColor: "#ce9eff",
                "&:hover": {
                  backgroundColor: "#b46bff",
                },
              }}
              onClick={() => {
                document.querySelector(".contentframe").scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth",
                });
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </Zoom>
        </Box>
      )}
    </Box>
  );
};

export default Messages;
