import { Alert, Box, Button, Container, Snackbar, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile } from '../../store/slices/userSlice';

import { RootState } from '../../store/rootReducer';
import axios from 'axios';
import { useAppDispatch } from '../../store';
import { useSelector } from 'react-redux';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user.profile);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', {
        name,
        email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      dispatch(updateUserProfile(response.data));
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || 'Failed to update profile');
      setSnackbarSeverity('error');
    }
    setOpen(true);
  };

  const handleChangePassword = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity('success');
    } catch (error: any) {
      setSnackbarMessage(error.response?.data?.message || 'Failed to change password');
      setSnackbarSeverity('error');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateProfile}
            fullWidth
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Box>
        <Box mt={5}>
          <Typography variant="h5" component="h2" gutterBottom>
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
              fullWidth
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Box>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;