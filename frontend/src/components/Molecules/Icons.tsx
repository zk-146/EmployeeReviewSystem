import { DropDownIcon, ProfileIcon } from "../Atoms/Icons";
import React, { useState } from "react";

interface ProfileIconProps {
  selected: boolean;
}
export const ProfileDropDownIcon: React.FC<ProfileIconProps> = ({
  selected,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ProfileIcon selected={selected} />
      {/* <DropDownIcon selected={selected} /> */}
    </div>
  );
};
