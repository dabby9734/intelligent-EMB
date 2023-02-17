import { useState, useEffect, useContext } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Divider,
} from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InboxIcon from "@mui/icons-material/Inbox";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArticleIcon from "@mui/icons-material/Article";
import ModeIcon from "@mui/icons-material/Mode";
import StarIcon from "@mui/icons-material/Star";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { getCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

import { ColorModeContext } from "../pages/_app";
import { navPrefsContext } from "../pages/_app";

const MobileNavbar = () => {
  const router = useRouter();

  const [user, setUser] = useState("");

  useEffect(() => {
    setUser(
      localStorage.getItem("name")
        ? localStorage
            .getItem("name")
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
            .join(" ") // converts JOHN SMITH to John Smith
        : getCookie("username")
    );
  }, []);

  const data = [
    {
      icon: <AccountCircleIcon />,
      text: user ? `Welcome, ${user}` : "Account",
    },
    { icon: <InboxIcon />, text: "Inbox", type: "inbox" },
    {
      icon: <MailOutlineIcon />,
      text: "Updated Messages",
      type: "updated-messages",
    },
    { icon: <ArticleIcon />, text: "My Messages", type: "my-messages" },
    { icon: <ModeIcon />, text: "My Drafts", type: "my-drafts" },
    { icon: <StarIcon />, text: "Starred", type: "starred" },
    { icon: <ArchiveIcon />, text: "Archived", type: "archived" },
  ];

  const getHref = (router, type) => {
    const idToBoard = {
      1048: "student",
      1039: "service",
      1050: "lost-and-found",
    };

    if (router.route.includes("/post") && idToBoard[router.query.boardID]) {
      return `${idToBoard[router.query.boardID]}?type=${type}`;
    }

    if (
      ["/student", "/service", "/lost-and-found"].some(
        (board) => router.route === board
      )
    ) {
      return `${router.route}?type=${type}`;
    }
  };
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const ctx = useContext(navPrefsContext);

  return (
    <>
      <Drawer
        anchor="left"
        open={ctx.navPrefs?.mobileNavOpen ?? false}
        onClose={() =>
          ctx.setNavPrefs({ ...ctx.navPrefs, mobileNavOpen: false })
        }
        className="mobile-only"
      >
        <List>
          {data.map((item) => (
            <ListItem
              component={item.type ? "a" : "div"}
              onClick={() => {
                ctx.setNavPrefs({ ...ctx.navPrefs, mobileNavOpen: false });
              }}
              href={getHref(router, item.type)}
              key={item.text}
            >
              <ListItemButton
                sx={{
                  borderRadius: "2rem",
                  color:
                    router.query.type !== undefined &&
                    router.query.type === item.type
                      ? "var(--accent)"
                      : "",
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      router.query.type !== undefined &&
                      router.query.type === item.type
                        ? "var(--accent)"
                        : "",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider />
          <ListItem>
            <ListItemButton
              sx={{
                borderRadius: "2rem",
              }}
              onClick={() => {
                colorMode.toggleColorMode(
                  theme.palette.mode === "dark" ? "light" : "dark"
                );
              }}
            >
              <ListItemIcon>
                {theme.palette.mode === "dark" ? (
                  <DarkModeIcon />
                ) : (
                  <LightModeIcon />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  theme.palette.mode === "dark"
                    ? "Light Mode 🌈"
                    : "Dark Mode 🌌"
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default MobileNavbar;
