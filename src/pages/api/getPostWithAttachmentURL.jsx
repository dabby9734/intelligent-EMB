import { parse } from "node-html-parser";
const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");

async function handler(req, res) {
  // only accept POST requests
  if (req.method != "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { veriTokenCookie, authToken, sessionID, pid, boardID } = {
    ...req.body,
  };

  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "production"
      ? {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        }
      : {}
  );
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    referer: `https://iemb.hci.edu.sg/Board/Detail/${boardID}`,
    "user-agent":
      "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Mobile Safari/537.36",
    cookie: `__RequestVerificationToken=${veriTokenCookie};.Mozilla%2f4.0+(compatible%3b+MSIE+6.1%3b+Windows+XP);ASP.NET_SessionId=${sessionID}; AuthenticationToken=${authToken};`,
  });

  await page.goto(
    `https://iemb.hci.edu.sg/Board/content/${pid}?board=${boardID}&isArchived=False`,
    { waitUntil: "networkidle0" }
  );

  //   parse the html
  const iembHTML = parse(await page.content());

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
      message: "Error while processing your request, try refreshing the page",
    });
  }

  const post = iembHTML.querySelector(
    "div.box#fontBox > div#hyplink-css-style > div"
  );

  const attachmentsRaw = iembHTML.querySelectorAll(
    "div#attaches > div.CrossFile > a"
  );

  let attachments = [];
  if (attachmentsRaw.length > 0) {
    attachments = attachmentsRaw.map((attachment) => {
      const params = attachment.attributes.href.match(
        /javascript:show_f\('(.*?)',(.*?),'(.*?)','(.*?)','(.*?)'\);/
      );
      const fileName = params[1];
      const fileType = params[2];
      const fileID = params[3];
      const boardID = params[4];
      const containerType = params[5];

      return {
        url: `Board/showFile?t=${fileType}&ctype=${containerType}&id=${fileID}&file=${encodeURI(
          fileName
        )}&boardId=${boardID}`,
        fileName,
      };
    });
  }

  // ! close browser
  await browser.close();

  return res.status(200).json({
    success: true,
    message: "Post successfully fetched",
    post: post.innerHTML.toString(),
    attachments: attachments,
  });
}

export default handler;
