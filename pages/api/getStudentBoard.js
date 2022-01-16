import { parse } from "node-html-parser";

async function handler(req, res) {
  const { veriTokenCookie, authToken, sessionID } = { ...req.body };
  const response = await fetch("https://iemb.hci.edu.sg/Board/Detail/1048", {
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
  });

  const iembHTML = parse(await response.text());

  const needsSignIn = iembHTML.querySelector(".login-page");
  if (needsSignIn) {
    return res.status(200).json({
      success: false,
      message: "Needs to sign in",
    });
  }

  const messageSections = iembHTML.querySelectorAll("table.tablesorter");

  const [unreadMessages, readMessages] = messageSections.map((section) => {
    return section.querySelectorAll("tbody > tr");
  });

  const messages = {
    unread: [],
    read: [],
  };

  if (!unreadMessages[0].querySelector("td > b")) {
    console.log("there are unread messages");
    unreadMessages.forEach((message) => {
      const data = message.querySelectorAll("td");
      console.log(data.length);
    });
  }

  if (!readMessages[0].querySelector("td > b")) {
    console.log("there are read messages");
    readMessages.forEach((message) => {
      const data = message.querySelectorAll("td");

      messages.read.push({
        date: data[0].rawText,
        sender: data[1].querySelector("a").getAttribute("tooltip-data"),
        username: data[1].querySelector("a").rawText.trim(),
        subject: data[2].querySelector("a").rawText,
        url: data[2].querySelector("a").getAttribute("href"),
        urgency: data[3].querySelector("img").getAttribute("alt"),
        recipient: data[4].rawText.trim(),
        viewCount: data[5].rawText.match(/Viewer:\s+(\d+)/)[1],
        replyCount: data[5].rawText.match(/Response:\s+(\d+)/)[1],
      });
    });
  }

  res.status(200).json({ success: true, messages });
}

export default handler;
