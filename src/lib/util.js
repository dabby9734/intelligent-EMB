import { getCookie } from "./cookieMonster";

export const getTimePassed = (date) => {
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

export const urgencyToColor = (urgency) => {
  const colors = {
    Information: "#4caf50",
    Important: "#ff9800",
    Urgent: "#f44336",
  };

  if (urgency in colors) {
    return colors[urgency];
  } else return "#ce9eff";
};

export const getApiURL = (route) => {
  let url = new URL(
    `https://iemb-backend-cloudflare-workers.dabby.workers.dev/${route}`
  );
  url.searchParams.append("authToken", getCookie("auth_token"));
  url.searchParams.append("veriToken", getCookie("veri_token"));
  url.searchParams.append("sessionID", getCookie("sess_id"));
  return url;
};

export const truncate = (str) => {
  // util function to truncate a string
  // unfortunately I don't like the result I get so I'm not implementing it into the app yet
  if (typeof window !== "undefined") {
    let width = window.innerWidth;
    let maxchars = Math.floor(width / 12);
    console.log(maxchars);
    return str.replace(new RegExp(`(.{${maxchars}})..+`), "$1…");
  } else return str;
};

export const removeTags = (str) => {
  // util function to remove tags
  // unfortunately I don't like the result I get so I'm not implementing it into the app yet
  return str.replace(/\[[^\]]*\]?/, "");
};

export const validateRedirect = (path) => {
  // util function to validate redirect url
  // action, pid, boardID
  const re = new RegExp(
    "^s/(student|service|lost-and-found)?type=(inbox|updated-messages|my-messages|my-drafts|starred|archived)",
    "gm"
  );

  return re.test(path) || path.startsWith("/post");
};
