import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import { Chip, useTheme } from "@mui/material";

const PostInfo = ({ info }) => {
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
      </div>
    </div>
  );
};

export default PostInfo;
