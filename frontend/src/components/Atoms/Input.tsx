import { TextField, TextFieldProps } from '@mui/material';

import React from 'react';

type CustomTextFieldProps = TextFieldProps & {
    label: string;
    error?: boolean;
    helperText?: string;
};

const Input: React.FC<CustomTextFieldProps> = ({ label, error, helperText, ...props }) => {
  return (
    <TextField
      label={label}
      error={error}
      helperText={helperText}
      variant="outlined"
      fullWidth
      {...props}
    />
  );
};

export default Input;