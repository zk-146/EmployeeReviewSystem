import React, { Component } from "react";
import { WithStyles, createStyles } from "@mui/styles";

import { LinearProgress } from "@mui/material";
import { withStyles } from "@mui/styles";

interface Props extends WithStyles<typeof styles> {
  variant: "determinate" | "indeterminate" | "buffer" | "query";
  value: number;
  marginTop: number;
}

class ColoredLinearProgress extends Component<Props> {
  render() {
    const { classes, variant, value, marginTop } = this.props;
    return (
      <LinearProgress
        variant={variant}
        value={value}
        classes={{
          colorPrimary: classes.colorPrimary,
          barColorPrimary: classes.barColorPrimary,
        }}
        sx={{ marginTop }}
      />
    );
  }
}

const styles = () => ({
  colorPrimary: {
    backgroundColor: "#B2F2E2",
  },
  barColorPrimary: {
    backgroundColor: "#4EDB9D",
  },
});

export default withStyles(styles)(ColoredLinearProgress);
