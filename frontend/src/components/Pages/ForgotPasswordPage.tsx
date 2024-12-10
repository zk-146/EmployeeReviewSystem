import * as Yup from 'yup';

import { Box, Container, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';

import Button from '../Atoms/Button';
import Input from '../Atoms/Input';
import React from 'react';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ForgotPasswordPage: React.FC = () => {
  const handleSubmit = async (values: { email: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Password reset link sent to your email');
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <Field
                name="email"
                type="email"
                as={Input}
                label="Email"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />
              <Box mt={2}>
                <Button type="submit" label="Send Reset Link" color="primary" variant="contained" fullWidth />
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;