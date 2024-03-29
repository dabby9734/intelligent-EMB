import { useContext } from "react";
import { getCookie } from "../lib/cookieMonster";
import download from "downloadjs";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { Grid, useTheme } from "@mui/material";
import { refreshToken } from "../lib/browserMonster";
import { notifContext } from "../pages/_app";
import { getApiURL } from "../lib/util";

const PostContent = ({ attachments, content }) => {
  const notif = useContext(notifContext);

  const downloadFile = async (attachment) => {
    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken(async () => {
        downloadFile(attachment);
      }, notif.open);
    }

    const response = await fetch(getApiURL("download"), {
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
    }).catch((err) => {
      console.log(err);
      notif.open("Error downloading file");
    });

    if (response.status != 200) {
      const data = await response.json();
      notif.open(data.message);

      if (data.message == "Needs to refresh token") {
        return await refreshToken(async () => {
          downloadFile(attachment);
        }, notif.open);
      } else notif.open("Error downloading file");
    }

    const blob = await response.blob();
    download(blob, attachment.fileName, blob.type);
  };

  const theme = useTheme();

  const clearWhiteBg = (content) => {
    content = content.replace(
      /background-color:\s*(rgba?\(255[,\s]*255[,\s]*255[,\s]*1?\))|(#f*)|(hsl\([\d\s]*%,[\d\s]*,\s*100%\))/gm,
      ""
    );
    content = content.replace(
      /color:\s*(rgba?\([\d\s,]*\))|(#0*)|(hsl\([\d\s]*%,[\d\s]*,\s*\d+%\))/gm,
      ""
    );

    return content;
  };

  const processPostHTML = (content) => {
    content = clearWhiteBg(content);
    return content;
  };

  return (
    <div className="post">
      <div
        className="post-content"
        style={{ color: theme.palette.text.primary }}
        dangerouslySetInnerHTML={{ __html: processPostHTML(content) }}
      />
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
