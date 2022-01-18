import { parse } from "node-html-parser";

async function handler(req, res) {
  // only accept POST requests
  if (req.method != "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { veriTokenCookie, authToken, sessionID, boardID } = {
    ...req.body,
  };

  const response = await fetch(
    `https://iemb.hci.edu.sg/Board/Detail/${boardID}`,
    {
      method: "GET",
      mode: "no-cors",
      headers: {
        host: "iemb.hci.edu.sg",
        referer: "https://iemb.hci.edu.sg/",
        origin: "https://iemb.hci.edu.sg",
        "content-type": "application/x-www-form-urlencoded",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Mobile Safari/537.36",
        cookie: `__RequestVerificationToken=${veriTokenCookie};.Mozilla%2f4.0+(compatible%3b+MSIE+6.1%3b+Windows+XP);ASP.NET_SessionId=${sessionID}; AuthenticationToken=${authToken};`,
      },
    }
  );

  if (response.status != 200) {
    return res.status(200).json({
      success: false,
      message: "An error occured while processing your request",
    });
  }

  // parse the html
  const iembHTML = parse(await response.text());

  // check if we are stuck on the sign in page (i.e. needs a token refresh)
  const needsTokenRefresh = iembHTML.querySelector(".login-page");
  if (needsTokenRefresh) {
    return res.status(200).json({
      success: false,
      message: "Needs to refresh token",
    });
  }

  const messageSections = iembHTML.querySelectorAll("table.tablesorter");

  const [unreadMessages, readMessages] = messageSections.map((section) => {
    return section.querySelectorAll("tbody > tr");
  });

  const messages = [];

  if (!unreadMessages[0].querySelector("td > b")) {
    unreadMessages.forEach((message) => {
      const data = message.querySelectorAll("td");

      messages.push({
        date: data[0].text,
        sender: data[1].querySelector("a").getAttribute("tooltip-data"),
        username: data[1].querySelector("a").text.trim(),
        subject: data[2].querySelector("a").text,
        url: data[2]
          .querySelector("a")
          .getAttribute("href")
          .match(/\/Board\/content\/(\d+)/)[1],
        urgency: data[3].querySelector("img").getAttribute("alt"),
        recipient: data[4].text.trim(),
        viewCount: data[5].text.match(/Viewer:\s+(\d+)/)[1],
        replyCount: data[5].text.match(/Response:\s+(\d+)/)[1],
        read: false,
      });
    });
  }

  if (!readMessages[0].querySelector("td > b")) {
    readMessages.forEach((message) => {
      const data = message.querySelectorAll("td");

      messages.push({
        date: data[0].text,
        sender: data[1].querySelector("a").getAttribute("tooltip-data"),
        username: data[1].querySelector("a").text.trim(),
        subject: data[2].querySelector("a").text,
        url: data[2]
          .querySelector("a")
          .getAttribute("href")
          .match(/\/Board\/content\/(\d+)/)[1],
        urgency: data[3].querySelector("img").getAttribute("alt"),
        recipient: data[4].text.trim(),
        viewCount: data[5].text.match(/Viewer:\s+(\d+)/)[1],
        replyCount: data[5].text.match(/Response:\s+(\d+)/)[1],
        read: true,
      });
    });
  }

  res
    .status(200)
    .json({ success: true, message: "Fetched messages!", messages });
}

export default handler;
