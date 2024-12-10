import * as Yup from 'yup';

import { Box, Container, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';

import Button from '../Atoms/Button';
import Input from '../Atoms/Input';
import React from 'react';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string().required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Required'),
});

const ResetPasswordPage: React.FC = () => {
  const handleSubmit = async (values: { password: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Password has been reset');
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <Field
                name="password"
                type="password"
                as={Input}
                label="Password"
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />
              <Field
                name="confirmPassword"
                type="password"
                as={Input}
                label="Confirm Password"
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              <Box mt={2}>
                <Button type="submit" label="Reset Password" color="primary" variant="contained" fullWidth />
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;