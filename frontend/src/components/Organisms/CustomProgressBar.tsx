import { Box, LinearProgress } from "@mui/material";

import React from "react";

export const CustomProgressBar = ({ value }: { value: number }) => {
  const segments = 4; // Total segments
  const filledSegments = Math.round((value / 100) * segments); // Calculate filled segments

  return (
    <Box
      sx={{
        display: "flex",
        height: 4,
        borderRadius: "0",
        backgroundColor: "#e0e0e0",
        width: "100%",
        maxWidth: 150,
      }}
    >
      {Array.from({ length: segments }).map((_, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            backgroundColor: index < filledSegments ? "#4EDB9D " : "#B2F2E2 ", // Green for filled, light gray for unfilled
            borderRight: index < segments - 1 ? "1px solid white" : "none", // Add separator
            borderRadius:
              index === 0
                ? "5px 0 0 5px"
                : index === segments - 1
                ? "0 5px 5px 0"
                : "none",
          }}
        />
      ))}
    </Box>
  );
};
