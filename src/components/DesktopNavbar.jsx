import { useState, useEffect, useContext } from "react";
import {
  Checkbox,
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
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ChatIcon from "@mui/icons-material/Chat";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SchoolIcon from "@mui/icons-material/School";

import { getCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

import { ColorModeContext } from "../pages/_app";
import { navPrefsContext } from "../pages/_app";

const DesktopNavbar = () => {
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

  useEffect(() => {
    let box = document.querySelector(".desktop-nav");

    let open = ctx.navPrefs?.desktopNavOpen ?? null;
    if (open === null) return;

    box.style.transition = "all 0.3s ease-in-out";
    box.style.transform = open ? `translateX(0)` : `translateX(-250px)`;
    box.style.opacity = open ? 1 : 0;
    box.style.width = open ? "250px" : "0";
  }, [ctx.navPrefs]);

  return (
    <div
      style={{
        maxWidth: 250,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <List className="desktop-only desktop-nav" dense>
        <ListItem>
          <ListItemButton
            sx={{
              borderRadius: "2rem",
              whiteSpace: "nowrap",
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText
              primary={user ? `${user}` : "Account"}
              sx={{ color: theme.palette.text.primary }}
            />
          </ListItemButton>
        </ListItem>
        {data.map((item) => (
          <ListItem
            component={item.type ? "a" : "div"}
            href={getHref(router, item.type)}
            key={item.text}
          >
            <ListItemButton
              sx={{
                borderRadius: "2rem",
                whiteSpace: "nowrap",
              }}
              selected={
                router.query.type !== undefined &&
                router.query.type === item.type
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        {[
          { icon: <PriorityHighIcon />, text: "Urgent" },
          { icon: <LabelImportantIcon />, text: "Important" },
          { icon: <ChatIcon />, text: "Information" },
          { icon: <MarkEmailReadIcon />, text: "Read" },
          { icon: <SchoolIcon />, text: "ECG" },
        ].map((item) => (
          <ListItem
            key={item.text}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={() => {
                  let messagePreferences = ctx.navPrefs.messagePrefs;
                  let setMessagePreferences = ctx.setNavPrefs;
                  if (messagePreferences === null) {
                    return;
                  }
                  if (messagePreferences.indexOf(item.text) !== -1) {
                    setMessagePreferences({
                      ...ctx.navPrefs,
                      messagePrefs: messagePreferences.filter(
                        (tag) => tag !== item.text
                      ),
                    });
                  } else {
                    setMessagePreferences({
                      ...ctx.navPrefs,
                      messagePrefs: [...messagePreferences, item.text],
                    });
                  }
                }}
                checked={ctx.navPrefs?.messagePrefs.indexOf(item.text) !== -1}
                inputProps={{ "aria-labelledby": item.text }}
              />
            }
          >
            <ListItemButton sx={{ borderRadius: "2rem" }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        <ListItem>
          <ListItemButton
            sx={{ borderRadius: "2rem", whiteSpace: "nowrap" }}
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
                theme.palette.mode === "dark" ? "Light Mode 🌈" : "Dark Mode 🌌"
              }
              sx={{ color: theme.palette.text.primary }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
};

export default DesktopNavbar;
