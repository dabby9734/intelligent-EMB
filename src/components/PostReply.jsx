import { useRouter } from "next/router";
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import LoadingButton from "@mui/lab/LoadingButton";
import { useState, useEffect, useContext } from "react";
import { getCookie, deleteCookie } from "../lib/cookieMonster";
import { refreshToken } from "../lib/browserMonster";
import { notifContext } from "../pages/_app";
import { getApiURL } from "../lib/util";

const PostReply = ({ info, boardID, pid }) => {
  const [selection, setSelect] = useState("");
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notif = useContext(notifContext);

  useEffect(() => {
    if (info.text) setVal(info.text);
    if (info.selection) setSelect(info.selection);
  }, [info]);

  const processReply = async () => {
    setLoading(true);

    if (
      !getCookie("auth_token") ||
      !getCookie("sess_id") ||
      !getCookie("veri_token")
    ) {
      return await refreshToken(processReply, notif.open, router);
    }

    const url = `${getApiURL(
      "reply"
    )}&pid=${pid}&boardID=${boardID}&replyContent=${encodeURIComponent(
      val
    )}&selection=${selection}`;
    const response = await fetch(url).catch((err) => {
      setLoading(false);
      notif.open();
      return;
    });

    if (response.status != 200) {
      notif.open("Failed to reply");
    }

    const data = await response.json();

    notif.open(data.message);
    if (!data.success) {
      if (data.message === "Needs to refresh token") {
        return await refreshToken(processReply, notif.open, router);
      }
      if (data.message === "Invalid username or password") {
        deleteCookie("username");
        deleteCookie("password");
        deleteCookie("auth_token");
        deleteCookie("sess_id");
        deleteCookie("veri_token");
        localStorage.clear();
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="post-reply"
      style={{ display: info.canReply ? "block" : "none" }}
    >
      <FormControl className="post-reply__selection" sx={{ width: "100%" }}>
        <FormLabel id="post-reply">Reply to post</FormLabel>
        <RadioGroup
          aria-labelledby="post-reply-selection-group"
          defaultValue={info.selection}
          name="post-reply-selection"
          row
          onChange={(e) => setSelect(e.target.value)}
        >
          <FormControlLabel value="A" control={<Radio />} label="A" />
          <FormControlLabel value="B" control={<Radio />} label="B" />
          <FormControlLabel value="C" control={<Radio />} label="C" />
          <FormControlLabel value="D" control={<Radio />} label="D" />
          <FormControlLabel value="E" control={<Radio />} label="E" />
        </RadioGroup>
        <TextField
          id="post-reply"
          aria-labelledby="post-reply-text-field"
          multiline
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
          }}
          placeholder="Enter your reply!"
          maxRows={10}
          fullWidth
        />
        <div className="post-reply-submit-button-right-align">
          <LoadingButton
            onClick={processReply}
            loading={loading}
            loadingPosition="end"
            endIcon={<ReplyIcon />}
            variant="contained"
            sx={{ maxWidth: "6rem", textTransform: "none" }}
            type="submit"
          >
            Reply
          </LoadingButton>
        </div>
      </FormControl>
    </div>
  );
};

export default PostReply;
