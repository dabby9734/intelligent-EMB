import { getCookie, setCookie } from "../lib/cookieMonster";
import download from "downloadjs";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { Grid } from "@mui/material";

const PostContent = ({ attachments, setInfo }) => {
  const refreshToken = async (attachment) => {
    const response = await fetch(
      `https://iemb-backend.azurewebsites.net/api/login?username=${encodeURI(
        getCookie("username")
      )}&password=${encodeURI(getCookie("password"))}`
    );

    if (response.status != 200) {
      return setInfo("Token refresh failed");
    }

    const data = await response.json();

    if (data.success) {
      setInfo(data.message);
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

      return await downloadFile(attachment);
    }

    if (data.message === "Invalid username or password") {
      router.push("/");
    } else {
      setInfo(data.message);
    }
  };

  const downloadFile = async (attachment) => {
    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken(attachment);
    }

    const response = await fetch("/api/downloadFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        veriTokenCookie: getCookie("veri_token"),
        authToken: getCookie("auth_token"),
        sessionID: getCookie("sess_id"),
        attachment,
      }),
    });

    if (response.status != 200) {
      const data = await response.json();
      setInfo(data.message);

      if (data.message == "Needs to refresh token") {
        return await refreshToken(attachment);
      } else return;
    }

    const blob = await response.blob();
    download(blob, attachment.fileName, blob.type);
  };

  return (
    // animation by:
    // https://codepen.io/stix/pen/qNZajO/
    <div className="post">
      <div className="post-content"></div>
      {attachments && (
        <div
          className="post-attachments"
          style={{ display: attachments.length ? "block" : "none" }}
        >
          <Grid container spacing={2}>
            {attachments.map((attachment) => (
              <Grid item xs={12} md={6} key={attachment.url}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    downloadFile(attachment);
                  }}
                  sx={{
                    width: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                >
                  {attachment.fileName}
                </Button>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
};

export default PostContent;
