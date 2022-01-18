async function handler(req, res) {
  // only accept POST requests
  if (req.method != "POST") {
    return res.status(405).send("Method not allowed");
  }

  // check if request is valid
  if (!req.body.username || !req.body.password) {
    return res
      .status(200)
      .json({ success: false, message: "Username and password are required" });
  }

  const response = await fetch("https://iemb.hci.edu.sg", {
    method: "GET",
    mode: "no-cors",
  });

  if (response.status != 200)
    return res
      .status(200)
      .json({ success: false, message: "Failed to fetch iemb.hci.edu.sg" });

  const VERI_TOKEN_COOKIE = response.headers
    .get("set-cookie")
    .match(/__RequestVerificationToken=(.+?);/)[1];

  const VERI_TOKEN = response.body
    .read()
    .toString()
    .match(/<input name=\"__RequestVerificationToken\" .+? value=\"(.+?)\"/)[1];

  const username = encodeURI(req.body.username);
  const password = encodeURI(req.body.password);
  const veriToken = encodeURI(VERI_TOKEN);

  const postData = `UserName=${username}&Password=${password}&__RequestVerificationToken=${veriToken}&submitbut=Submit`;
  const loginResponse = await fetch("https://iemb.hci.edu.sg/home/logincheck", {
    method: "POST",
    headers: {
      host: "iemb.hci.edu.sg",
      referer: "https://iemb.hci.edu.sg/",
      origin: "https://iemb.hci.edu.sg",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Mobile Safari/537.36",
      "content-length": postData.length,
      cookie: `__RequestVerificationToken=${VERI_TOKEN_COOKIE};.ASPXBrowserOverride=;`,
    },
    body: postData,
    redirect: "manual",
  });

  if (loginResponse.status != 302)
    return res.status(200).json({ success: false, message: "Failed to login" });

  if (
    !loginResponse.headers
      .get("set-cookie")
      .match(/ASP.NET_SessionId=(.+?);/) ||
    !loginResponse.headers.get("set-cookie").match(/AuthenticationToken=(.+?);/)
  ) {
    return res
      .status(200)
      .json({ success: false, message: "Invalid username or password" });
  }

  const SESSION_ID = loginResponse.headers
    .get("set-cookie")
    .match(/ASP.NET_SessionId=(.+?);/)[1];
  const AUTH_TOKEN = loginResponse.headers
    .get("set-cookie")
    .match(/AuthenticationToken=(.+?);/)[1];

  res
    .status(200)
    .json({ success: true, VERI_TOKEN_COOKIE, SESSION_ID, AUTH_TOKEN });
}

export default handler;
