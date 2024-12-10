import React, { useEffect } from 'react';

import { RootState } from '../../store/rootReducer';
import axios from 'axios';
import { logout } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LogoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.post(
            'http://localhost:5000/api/auth/logout',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        dispatch(logout());
        navigate('/login');
      } catch (error : any) {
        console.error('Logout failed:', error.response?.data || error.message);
      }
    };

    handleLogout();
  }, [dispatch, navigate]);

  return null;
};

export default LogoutPage;