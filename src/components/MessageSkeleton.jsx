import { Skeleton } from "@mui/lab";
import { Card } from "@mui/material";

export default function MessageSkeleton() {
  return (
    <div className="messages__item">
      <Card
        variant="outlined"
        className="messages__item__content" 
        sx={{
          borderLeft: "5px solid rgba(0, 0, 0, 0.11)",
          transformOrigin: "0 55%",
          animation: "fade-skeleton 1.5s ease-in-out 0.5s infinite",
        }}
      >
        <Skeleton animation="wave">
          <h2 className="messages__item__content__subject">
            {
              // randomly generate a string of 80-120 characters
              Array.from({
                length: Math.floor(Math.random() * (120 - 80 + 1)) + 80,
              }).toString()
            }
          </h2>
        </Skeleton>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton
            animation="wave"
            variant="circular"
            width={"1em"}
            height={"1em"}
          />
          <Skeleton
            animation="wave"
            variant="text"
            width={50}
            sx={{
              marginLeft: "0.5rem",
            }}
          >
            <span>Lorem</span>
          </Skeleton>
          <Skeleton
            animation="wave"
            variant="circular"
            width={"1em"}
            height={"1em"}
            sx={{
              marginLeft: "0.5rem",
            }}
          />
          <Skeleton
            animation="wave"
            variant="text"
            width={50}
            sx={{
              marginLeft: "0.5rem",
            }}
          >
            <span>Lorem</span>
          </Skeleton>
        </div>
      </Card>
    </div>
  );
}
