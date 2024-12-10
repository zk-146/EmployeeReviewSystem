import * as Yup from 'yup';

import { Alert, Box, Container, Snackbar, Typography } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { loginFailure, loginStart, loginSuccess } from '../../store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../Atoms/Button';
import Input from '../Atoms/Input';
import { RootState } from '../../store/rootReducer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Required'),
});

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state: RootState) => state.auth.error);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    dispatch(loginStart());
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', values);
      dispatch(loginSuccess(response.data));
      navigate('/dashboard');
    } catch (error : any) {
      dispatch(loginFailure(error.response?.data?.message || 'Registration failed'));
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        {/* {error && <Alert severity="error">{error}</Alert>} */}
        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <Field
                name="name"
                type="text"
                as={Input}
                label="Name"
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />
              <Field
                name="email"
                type="email"
                as={Input}
                label="Email"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />
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
                <Button type="submit" label="Register" color="primary" variant="contained" fullWidth />
              </Box>
            </Form>
          )}
        </Formik>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default RegisterPage;