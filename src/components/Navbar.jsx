import { useState, useEffect, useContext } from "react";
import {
  Drawer,
  List,
  Button,
  IconButton,
  Tooltip,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ExploreIcon from "@mui/icons-material/Explore";
import ConstructionIcon from "@mui/icons-material/Construction";
import LogoutIcon from "@mui/icons-material/Logout";
import ArchiveIcon from "@mui/icons-material/Archive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InboxIcon from "@mui/icons-material/Inbox";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArticleIcon from "@mui/icons-material/Article";
import ModeIcon from "@mui/icons-material/Mode";
import StarIcon from "@mui/icons-material/Star";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { getCookie, deleteCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

import { ColorModeContext } from "../pages/_app";

const Navbar = () => {
  const router = useRouter();
  const handleSignOut = () => {
    deleteCookie("username");
    deleteCookie("password");
    deleteCookie("auth_token");
    deleteCookie("sess_id");
    deleteCookie("veri_token");
    localStorage.clear();
    router.push("/");
  };

  const [open, setOpen] = useState(false);
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

  const pages = [
    {
      icon: <PeopleIcon />,
      text: "Student",
      path: "/student",
    },
    {
      icon: <ConstructionIcon />,
      text: "Service Request & Safety",
      path: "/service",
    },
    {
      icon: <ExploreIcon />,
      text: "Lost & Found",
      path: "/lost-and-found",
    },
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

  return (
    <>
      <Box
        className="nav"
        sx={{
          backgroundColor: theme.palette.background.default,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <div className="nav__menu-button">
          <Tooltip title="Menu" enterTouchDelay={0}>
            <div className="nav__item">
              <IconButton
                aria-label="Menu"
                onClick={() => setOpen(!open)}
                className="nav__item-button"
              >
                <MenuIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
        <div className="nav__paths">
          {pages.map((item) => (
            <Tooltip title={item.text} enterTouchDelay={0} key={item.text}>
              <div className="nav__item">
                <Button
                  className="nav__item-button desktop-only"
                  variant="text"
                  startIcon={item.icon}
                  href={`${item.path}?type=inbox`}
                  sx={{
                    textTransform: "none",
                    color:
                      router?.route === item.path
                        ? "var(--accent)"
                        : theme.palette.text.primary,
                  }}
                >
                  <span className="nav__item-text">{item.text}</span>
                </Button>
                <IconButton
                  aria-label={item.text}
                  href={`${item.path}?type=inbox`}
                  className="nav__item-button mobile-only"
                  sx={{
                    color:
                      router?.route === item.path
                        ? "var(--accent)"
                        : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </IconButton>
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="nav__sign-out-button">
          <Tooltip title="Sign Out" enterTouchDelay={0}>
            <div className="nav__item">
              <Button
                className="nav__item-button desktop-only"
                variant="text"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{
                  textTransform: "none",
                  color: theme.palette.text.primary,
                }}
              >
                <span className="nav__item-text">Sign Out</span>
              </Button>
              <IconButton
                aria-label="Sign Out"
                onClick={handleSignOut}
                className="nav__item-button mobile-only"
                sx={{ color: theme.palette.text.primary }}
              >
                <LogoutIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
      </Box>
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <List>
          {data.map((item) => (
            <ListItem
              component={item.type ? "a" : "div"}
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
                    ? "Dark Mode 🌌"
                    : "Light Mode 🌈"
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
