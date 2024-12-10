import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

import React from 'react';

interface ButtonProps extends MuiButtonProps {
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
  return (
    <MuiButton {...props}>
      {label}
    </MuiButton>
  );
};

export default Button;