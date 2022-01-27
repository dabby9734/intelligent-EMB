import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import { Chip } from "@mui/material";

const postInfo = ({ info }) => {
  return (
    <div className="post-info">
      <h1>{info && info.title}</h1>
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

export default postInfo;
