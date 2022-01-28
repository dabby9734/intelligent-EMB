import { Card, Fab } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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

const Messages = ({ messages, boardID }) => {
  return (
    <div className="messages" id="messages">
      <div className="messages__wrapper">
        {(!messages || messages.length === 0) && <h2>No messages</h2>}
        {!!messages &&
          messages
            ?.sort((a, b) => (a.url < b.url ? 1 : -1))
            // sort by pid
            // Fun fact: because iemb doesn't do this their messages are sorted correctly by date but not by time
            ?.map((message) => (
              <div className="messages__item" key={message.subject}>
                <Card
                  variant="outlined"
                  className={`messages__item__content ${
                    message.read ? "read-msg" : "unread-msg"
                  }`}
                  sx={{
                    borderLeft: `5px solid ${colors[message.urgency]}`,
                  }}
                >
                  <a href={`${boardID}/${message.url}`}>
                    <h2 className="messages__item__content__subject">
                      {message.subject}
                    </h2>
                    <div className="messages__item__content__info-wrapper">
                      <div className="messages__item__content__info-item">
                        <span className="messages__item__content__info-item-icon">
                          <PersonIcon fontSize="small" />
                        </span>
                        <span className="messages__item__content__info-item-field">
                          {message.sender}
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
        <Fab
          size="medium"
          color="secondary"
          aria-label="back-to-top"
          sx={{
            margin: 0,
            top: "auto",
            right: "2rem",
            bottom: "2rem",
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
      </div>
    </div>
  );
};

export default Messages;
