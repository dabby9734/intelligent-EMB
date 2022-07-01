import { Button, IconButton, Tooltip, useTheme, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ExploreIcon from "@mui/icons-material/Explore";
import ConstructionIcon from "@mui/icons-material/Construction";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { deleteCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

import { navPrefsContext } from "../pages/_app";
import { useContext } from "react";

const Header = () => {
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

  const theme = useTheme();

  const ctx = useContext(navPrefsContext);

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
                onClick={() => {
                  ctx.setNavPrefs({
                    ...ctx.navPrefs,
                    desktopNavOpen: !ctx.navPrefs.desktopNavOpen,
                    mobileNavOpen: !ctx.navPrefs.mobileNavOpen,
                  });
                }}
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
    </>
  );
};

export default Header;
