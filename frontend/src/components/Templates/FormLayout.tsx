import { Container, Paper, Typography } from '@mui/material';

import React from 'react';

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
}

const FormLayout: React.FC<FormLayoutProps> = ({ title, children }) => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2rem', marginTop: '2rem' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {children}
      </Paper>
    </Container>
  );
};

export default FormLayout;