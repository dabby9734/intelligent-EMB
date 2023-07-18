import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import { Chip, useTheme } from "@mui/material";

const PostInfo = ({ info, urlPath }) => {
  const theme = useTheme();

  return (
    <div className="post-info">
      <h1 style={{ color: theme.palette.text.primary }}>
        {info && info.title}
      </h1>
      <div className="post-info__meta">
        <div className="post-info__field-wrapper">
          <Chip
            size="small"
            icon={<PersonIcon fontSize="small" />}
            label={info && info.sender}
          />
        </div>

        <div className="post-info__field-wrapper">
          <Chip
            size="small"
            icon={<GroupIcon fontSize="small" />}
            label={info && info.receiver}
          />
        </div>
        <div className="post-info__field-wrapper">
          <Chip
            size="small"
            icon={<EventIcon fontSize="small" />}
            label={info && info.date}
          />
        </div>
        <div className="post-info__field-wrapper">
          <Chip
            size="small"
            icon={<LinkIcon fontSize="small" />}
            label="Share!"
            onClick={() => {
              let url = window.location.href;
              // append post info if we are viewing post using slideover
              const boardPaths = ["/student", "/service", "/lost-and-found"];
              console.log(info);
              if (boardPaths.indexOf(window.location.pathname) > -1)
                url = window.location.origin + urlPath;
              navigator.clipboard.writeText(url);
            }}
            variant="outlined"
          />
        </div>
      </div>
    </div>
  );
};

export default PostInfo;
