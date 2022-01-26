import { useState, useEffect } from "react";
import { Stack, Tooltip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ExploreIcon from "@mui/icons-material/Explore";
import ConstructionIcon from "@mui/icons-material/Construction";
import LogoutIcon from "@mui/icons-material/Logout";
import ArchiveIcon from "@mui/icons-material/Archive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { getCookie, deleteCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

const NavItem = (props) => {
  return (
    <a
      href={props.link}
      style={{
        color: props.router?.route === props.link ? "#ce9eff" : "",
      }}
    >
      <div className="nav__item__wrapper">
        <div className="nav__item">
          {props.children && (
            <span className="nav__item-icon">{props.children}</span>
          )}
          <span className="nav__item-text">{props.text}</span>
        </div>
      </div>
    </a>
  );
};

const Navbar = () => {
  const router = useRouter();
  const handleSignOut = () => {
    deleteCookie("username");
    deleteCookie("password");
    deleteCookie("auth_token");
    deleteCookie("sess_id");
    deleteCookie("veri_token");
    localStorage.removeItem("studentBoard");
    localStorage.removeItem("serviceBoard");
    localStorage.removeItem("lostBoard");
    router.push("/");
  };

  const [user, setUser] = useState("");
  useEffect(() => {
    setUser(getCookie("username"));
  }, []);

  return (
    <div className="nav">
      <div className="nav__wrapper">
        <div className="nav__item__wrapper">
          <Tooltip title={user} disableFocusListener>
            <div className="nav__item bg-disabled">
              <span className="nav__item-icon">
                <AccountCircleIcon />
              </span>
              <span className="nav__item-text">Signed in as:&nbsp;{user}</span>
            </div>
          </Tooltip>
        </div>
        <NavItem text="Student" link="/student" router={router}>
          <PeopleIcon fontSize="small" />
        </NavItem>
        <NavItem
          text="Service Request &amp; Safety"
          link="/service"
          router={router}
        >
          <ConstructionIcon fontSize="small" />
        </NavItem>
        <NavItem text="Lost &amp; Found" link="/lost-and-found" router={router}>
          <ExploreIcon fontSize="small" />
        </NavItem>
        <NavItem text="Archive" link="/archive">
          <ArchiveIcon fontSize="small" />
        </NavItem>
        <div className="nav__item__wrapper" onClick={handleSignOut}>
          <div className="nav__item bg-true">
            <span className="nav__item-icon">
              <LogoutIcon fontSize="small" />
            </span>
            <span className="nav__item-text">Sign Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
