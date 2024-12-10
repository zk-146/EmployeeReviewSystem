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

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state: RootState) => state.auth.error);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    dispatch(loginStart());
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', values);
      dispatch(loginSuccess(response.data));
      navigate('/dashboard');
    } catch (error : any) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
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
          Login
        </Typography>
        {/* {error && <Alert severity="error">{error}</Alert>} */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
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
              <Field
                name="password"
                type="password"
                as={Input}
                label="Password"
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />
              <Box mt={2}>
                <Button type="submit" label="Login" color="primary" variant="contained" fullWidth />
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

export default LoginPage;