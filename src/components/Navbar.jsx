import { Stack } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ConstructionIcon from "@mui/icons-material/Construction";
import LogoutIcon from "@mui/icons-material/Logout";
import ArchiveIcon from "@mui/icons-material/Archive";

import { deleteCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

const NavItem = (props) => {
  return (
    <a href={props.link}>
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

  return (
    <div className="nav">
      <Stack className="nav__wrapper">
        <NavItem text="Student" link="/student">
          <PeopleIcon fontSize="small" />
        </NavItem>
        <NavItem text="Service Request &amp; Safety" link="/service">
          <LocalShippingIcon fontSize="small" />
        </NavItem>
        <NavItem text="Lost &amp; Found" link="/lost-and-found">
          <ConstructionIcon fontSize="small" />
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
      </Stack>
    </div>
  );
};

export default Navbar;
