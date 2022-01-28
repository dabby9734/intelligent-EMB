// see https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
// on how to do download with fetch!! :D

import stream from "stream";
import { promisify } from "util";
import fetch from "node-fetch";
import { parse } from "node-html-parser";

const pipeline = promisify(stream.pipeline);

async function handler(req, res) {
  // only accept POST requests
  if (req.method != "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { veriTokenCookie, authToken, sessionID, attachment } = { ...req.body };

  const response = await fetch(`https://iemb.hci.edu.sg/${attachment.url}`, {
    method: "GET",
    mode: "no-cors",
    headers: {
      host: "iemb.hci.edu.sg",
      referer: `https://iemb.hci.edu.sg/Board/content/${attachment.fileID}?board=${attachment.boardID}&isArchived=False`,
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Mobile Safari/537.36",
      cookie: `__RequestVerificationToken=${veriTokenCookie};.Mozilla%2f4.0+(compatible%3b+MSIE+6.1%3b+Windows+XP);ASP.NET_SessionId=${sessionID}; AuthenticationToken=${authToken};`,
    },
  });

  if (response.status != 200 || !response.headers.get("content-disposition")) {
    // parse the html
    const iembHTML = parse(await response.text());

    // check if we are stuck on the sign in page (i.e. needs a token refresh)
    const needsTokenRefresh = iembHTML.querySelector(".login-page");
    if (needsTokenRefresh) {
      return res.status(401).json({
        success: false,
        message: "Needs to refresh token",
      });
    }

    return res.status(503).json({
      success: false,
      message: "Failed to download file",
    });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=dummy.pdf");
  await pipeline(response.body, res);
}

export default handler;
