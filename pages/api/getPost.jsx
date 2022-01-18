import { parse } from "node-html-parser";

async function handler(req, res) {
  // only accept POST requests
  if (req.method != "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { veriTokenCookie, authToken, sessionID, pid, boardID } = {
    ...req.body,
  };

  const response = await fetch(
    `https://iemb.hci.edu.sg/Board/content/${pid}?board=${boardID}&isArchived=False`,
    {
      method: "GET",
      mode: "no-cors",
      headers: {
        host: "iemb.hci.edu.sg",
        referer: `https://iemb.hci.edu.sg/Board/Detail/${boardID}`,
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

  //   parse the html
  const iembHTML = parse(await response.text());

  //   check if we are stuck on the sign in page (i.e. needs a token refresh)
  const needsTokenRefresh = iembHTML.querySelector(".login-page");
  if (needsTokenRefresh) {
    return res.status(200).json({
      success: false,
      message: "Needs to refresh token",
    });
  }

  // check if we got sent a `Sorry, an error occurred while processing your request.` instead of the post
  const postExists = iembHTML.querySelector("div.iemb_contents");
  if (!postExists) {
    return res.status(200).json({
      success: false,
      message: "Post does not exist",
    });
  }

  const post = iembHTML.querySelector(
    "div.box#fontBox > div#hyplink-css-style > div"
  );

  return res.status(200).json({
    success: true,
    message: "Post successfully fetched",
    post: post.innerHTML.toString(),
  });
}

export default handler;
