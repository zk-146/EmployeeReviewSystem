import React, { useState } from "react";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { Search } from "@mui/icons-material";

interface SearchIconProps {
  focused: boolean;
}

interface ProfileIconProps {
  selected: boolean;
}
interface DropDownIconProps {
  selected: boolean;
}

interface NotificationIconProps {
  selected: boolean;
}

interface LogOffIconProps {
  selected: boolean;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ focused }) => {
  return (
    <Search
      style={{
        color: focused ? "#000" : "gray",
        transition: "all linear 100ms",
      }}
    />
  );
};

export const ProfileIcon: React.FC<ProfileIconProps> = ({ selected }) => {
  return (
    <AccountCircleOutlinedIcon
      style={{
        color: selected ? "gray" : "#000",
        transition: "all linear 200ms",
      }}
    />
  );
};

export const DropDownIcon: React.FC<DropDownIconProps> = ({ selected }) => {
  return (
    <ArrowDropDownOutlinedIcon
      style={{
        color: "#000",
        transform: selected ? "rotate(-180deg)" : "rotate(0deg)",
        transition: "all linear 200ms",
      }}
    />
  );
};

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  selected,
}) => {
  return (
    <NotificationsNoneIcon
      style={{
        color: selected ? "gray" : "#000",
        transition: "all linear 200ms",
      }}
    />
  );
};

export const LogOffIcon: React.FC<LogOffIconProps> = ({ selected }) => {
  return (
    <PowerSettingsNewIcon
      style={{
        color: selected ? "#FF7F7F" : "#FF2C2C",
        transition: "all linear 200ms",
      }}
    />
  );
};
