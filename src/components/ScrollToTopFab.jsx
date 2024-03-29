import { Fab, Zoom } from "@mui/material";
import { useState, useEffect } from "react";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTopFab = () => {
  // Control visibility floating action button to go back up
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    document.querySelector(".messages").addEventListener("scroll", (e) => {
      listenToScroll(e);
    });
    return () =>
      document
        .querySelector(".messages")
        ?.removeEventListener("scroll", (e) => {
          listenToScroll(e);
        });
  }, []);
  const listenToScroll = (e) => {
    if (e.target.scrollTop > 200) {
      setIsVisible(true);
    } else setIsVisible(false);
  };

  return (
    <Zoom in={isVisible} timeout={300}>
      <Fab
        size="medium"
        color="secondary"
        aria-label="back-to-top"
        sx={{
          position: "absolute",
          bottom: "3.2rem",
          right: "2rem",
          backgroundColor: "#ce9eff",
          "&:hover": {
            backgroundColor: "#b46bff",
          },
        }}
        onClick={() => {
          document.querySelector(".messages").scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTopFab;
