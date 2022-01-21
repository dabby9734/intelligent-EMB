import { getCookie } from "../lib/cookieMonster";
import download from "downloadjs";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { Grid } from "@mui/material";

const PostContent = ({ attachments, setInfo }) => {
  const downloadFile = async (fileUrl, fileName) => {
    const response = await fetch("/api/downloadFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        veriTokenCookie: getCookie("veri_token"),
        authToken: getCookie("auth_token"),
        sessionID: getCookie("sess_id"),
        fileUrl: fileUrl,
        fileName: fileName,
      }),
    });

    if (response.status != 200) {
      return setInfo("Download failed, try refreshing the page");
    }

    const blob = await response.blob();
    download(blob, fileName, blob.type);
  };

  return (
    // animation by:
    // https://codepen.io/stix/pen/qNZajO/
    <div className="post">
      <div className="post-content"></div>
      {attachments && (
        <div className="post-attachments">
          <Grid container spacing={2}>
            {attachments.map((attachment) => (
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    downloadFile(attachment.url, attachment.fileName);
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
