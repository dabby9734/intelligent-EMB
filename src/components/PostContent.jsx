import { useRouter } from "next/router";
import { getCookie } from "../lib/cookieMonster";
import download from "downloadjs";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { Grid, useTheme } from "@mui/material";
import { refreshToken } from "../lib/browserMonster";

const PostContent = ({ attachments, setInfo, content }) => {
  const router = useRouter();
  const downloadFile = async (attachment) => {
    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken(
        async () => {
          downloadFile(attachment);
        },
        setInfo,
        router
      );
    }

    const response = await fetch(
      "https://iemb-backend.azurewebsites.net/api/download",
      {
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
      }
    ).catch((err) => {
      console.log(err);
      setInfo("Error downloading file");
    });

    if (response.status != 200) {
      const data = await response.json();
      setInfo(data.message);

      if (data.message == "Needs to refresh token") {
        return await refreshToken(
          async () => {
            downloadFile(attachment);
          },
          setInfo,
          router
        );
      } else setInfo("Error downloading file");
    }

    const blob = await response.blob();
    download(blob, attachment.fileName, blob.type);
  };

  const theme = useTheme();

  const clearWhiteBg = (content) => {
    let pattern = content.match(/background-color:\s*(rgba?\(255[,\s]*255[,\s]*255[,\s]*1?\))|(#f*)|(hsl\(0[,\s]*0%[,\s]*100%\))/)
    if (pattern) {
      content = content.replace(pattern, "");
      content = content.replace(/color:[a-zA-Z0-9#,\(\)\s]*(;|">)/, "") 
    }
    return content
  }

  return (
    // animation by:
    // https://codepen.io/stix/pen/qNZajO/
    <div className="post">
      <div
        className="post-content"
        style={{ color: theme.palette.text.primary }}
        dangerouslySetInnerHTML={{ __html: clearWhiteBg(content) }}
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
