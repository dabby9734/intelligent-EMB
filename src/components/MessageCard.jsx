import { useTheme, Card, Checkbox } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import { urgencyToColor, getTimePassed, getApiURL } from "../lib/util";
import { amber } from "@mui/material/colors";
import { useState, useEffect, useContext } from "react";
import { notifContext } from "../pages/_app";
import { checkCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";
import { useRouter } from "next/router";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const MessageCard = ({ message, fav, setFav, messages, boardtype }) => {
  const theme = useTheme();
  const notif = useContext(notifContext);
  const router = useRouter();

  const updateStarredStatus = async (pid, bid, status) => {
    // immediately refresh token if it has expired already
    // saves ~2s because iemb is slow...
    if (
      !checkCookie("auth_token") ||
      !checkCookie("sess_id") ||
      !checkCookie("veri_token")
    ) {
      return await refreshToken(
        async () => updateStarredStatus(pid, bid, status),
        notif.open,
        router
      );
    }

    const url = `${getApiURL("star")}&bid=${bid}&pid=${pid}&status=${status}`;
    const response = await fetch(url).catch((err) => {
      return notif.open(
        "An error occured while updating starred status for post " + pid,
        "error"
      );
    });

    switch (response.status) {
      case 401:
        return await refreshToken(
          async () => updateStarredStatus(pid, bid, status),
          notif.open,
          router
        );
      case 200:
        if (status) {
          // star smth previously unstarred
          let newStarredMsg = messages.find(
            (elem) => elem.pid.toString() === pid.toString()
          );
          setFav([newStarredMsg, ...fav]);
        } else {
          // unstar smth previously starred
          let newStarredMsgs = fav.filter(
            (elem) => elem.pid.toString() !== pid.toString()
          );
          setFav(newStarredMsgs);
        }
        localStorage.setItem(`${bid}+starred`, JSON.stringify(fav));
        return notif.open(
          `Successfully ${status ? "starred" : "unstarred"} post ${pid}`,
          "success"
        );
      default:
        // also handles response code 500
        return notif.open(
          "An error occured while updating starred status for post " + pid,
          "error"
        );
    }
  };

  const handleStarredStatusChange = async (e) => {
    setLoading(true);
    try {
      await updateStarredStatus(message.pid, message.boardID, e.target.checked);
    } catch (e) {
      console.log(e);
      notif.open(
        "An error occured while updating starred status for post " + pid,
        "error"
      );
    }
    setLoading(false);
  };

  const [loading, setLoading] = useState(false);
  const [isMessageStarred, setIsMessageStarred] = useState(false);

  useEffect(() => {
    if (fav == null) {
      setLoading(true);
      setIsMessageStarred(false);
    } else {
      setIsMessageStarred(
        !!fav.find((elem) => elem.pid.toString() === message.pid.toString())
      );
      setLoading(false);
    }
  }, [fav]);

  return (
    <div className="messages__item">
      <Card
        variant="outlined"
        className={`messages__item__content ${
          message.read ? "read-msg" : "unread-msg"
        }`}
        sx={{
          borderLeft: `5px solid ${urgencyToColor(message.urgency)}`,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
        }}
      >
        <a
          href={`/post?boardID=${message.boardID}&pid=${message.pid}&type=${boardtype}`}
        >
          <h2 className="messages__item__content__subject">
            {message.subject}
          </h2>
        </a>
        <div className="messages__item__content__info-wrapper">
          <div className="messages__item__content__info-item">
            <span className="messages__item__content__info-item-icon">
              <PersonIcon fontSize="small" />
            </span>
            <span className="messages__item__content__info-item-field">
              {message.username ? message.username : message.sender}
            </span>
          </div>
          <div className="messages__item__content__info-item">
            <span className="messages__item__content__info-item-icon">
              <EventIcon fontSize="small" />
            </span>
            <span className="messages__item__content__info-item-field">
              {getTimePassed(message.date)}
            </span>
          </div>
          <div className="messages__item__content__info-item">
            <span className="messages__item__content__info-item-field">
              {loading ? (
                <Checkbox
                  checked={false}
                  icon={<AutorenewIcon className="rotate" fontSize="small" />}
                />
              ) : (
                <Checkbox
                  aria-label="star"
                  checked={isMessageStarred}
                  onChange={handleStarredStatusChange}
                  icon={<StarBorderIcon fontSize="small" />}
                  checkedIcon={
                    <StarIcon fontSize="small" sx={{ color: amber[500] }} />
                  }
                />
              )}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageCard;
