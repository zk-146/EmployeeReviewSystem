import { AppBar, Box, Toolbar } from "@mui/material";
import { LogOffIcon, NotificationIcon, ProfileIcon } from "../Atoms/Icons";

import { ProfileDropDownIcon } from "../Molecules/Icons";
import React from "react";
import SearchBar from "../Molecules/InputWithIcon";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const handleIconClick = (iconName: string) => {
    switch (iconName) {
      case "logoff":
        logOffUser();
        break;
      case "profile":
        navigateToProfile();
        break;
      case "notification":
        displayNotifications();
        break;
    }
    setSelectedIcon((prevSelectedIcon) =>
      prevSelectedIcon === iconName ? null : iconName
    );
  };

  const logOffUser = () => {
    navigate("/logout");
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  const displayNotifications = () => {
    console.log("Displaying notifications");
  };

  return (
    <AppBar
      position="static"
      style={{
        backgroundColor: "#f4f4f4",
        position: "fixed",
        width: "calc(100vw - 60px)",
        minHeight: "61.5px",
        justifySelf: "flex-end",
        boxShadow: "none",
        marginLeft: "60px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar
        style={{
          minHeight: "61.5px",
        }}
      >
        <Box display="flex" flexGrow={1}>
          <SearchBar />
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            mr={3}
            style={{ cursor: "pointer" }}
            onClick={() => handleIconClick("profile")}
            onMouseEnter={() => setSelectedIcon("profile")}
            onMouseLeave={() => setSelectedIcon("")}
          >
            <ProfileDropDownIcon selected={selectedIcon === "profile"} />
          </Box>
          <Box
            mr={3}
            style={{ cursor: "pointer" }}
            onClick={() => handleIconClick("notification")}
            onMouseEnter={() => setSelectedIcon("notification")}
            onMouseLeave={() => setSelectedIcon("")}
          >
            <NotificationIcon selected={selectedIcon === "notification"} />
          </Box>
          <Box
            mr={1}
            style={{ cursor: "pointer" }}
            onClick={() => {
              handleIconClick("logoff");
            }}
            onMouseEnter={() => setSelectedIcon("logoff")}
            onMouseLeave={() => setSelectedIcon("")}
          >
            <LogOffIcon selected={selectedIcon === "logoff"} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
