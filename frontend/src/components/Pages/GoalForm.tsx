import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
    Fade
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { clearGoalMessages, createGoal, fetchCyclesForGoal } from '../../store/slices/goalsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../../store/slices/userSlice';

import { AppDispatch } from '../../store';
import { RootState } from '../../store/rootReducer';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GoalForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    const { cycles, loading, error, successMessage } = useSelector(
        (state: RootState) => state.goals
    );

    const userProfile = useSelector((state: RootState) => state.user.profile);
    const authUser = useSelector((state: RootState) => state.auth.user);
    const user = userProfile || authUser;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [reviewCycleId, setReviewCycleId] = useState('');

    useEffect(() => {
        dispatch(fetchCyclesForGoal());
        if (!userProfile) {
            dispatch(fetchUserProfile());
        }

        return () => {
            dispatch(clearGoalMessages());
        };
    }, [dispatch, userProfile]);

    // Auto-select active cycle if available
    useEffect(() => {
        if (cycles.length > 0 && !reviewCycleId) {
            const active = cycles.find((c: any) => c.status === 'Active');
            if (active) {
                setReviewCycleId(active._id);
            } else {
                setReviewCycleId(cycles[0]._id);
            }
        }
    }, [cycles, reviewCycleId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // console.log('User in GoalForm:', user); // Debugging
        if (!user?._id && !user?.id) {
            alert('User profile not loaded');
            return;
        }

        dispatch(createGoal({
            title,
            description,
            dueDate,
            reviewCycle: reviewCycleId,
            employee: user._id || user.id,
        }));
    };

    // Listen for success to redirect
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [successMessage, navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                pt: 8,
                pb: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}
        >
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3, color: '#555', textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Dashboard
                </Button>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '6px',
                            background: 'linear-gradient(90deg, #2196F3, #21CBF3)'
                        }}
                    />

                    <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#1a237e', mb: 1 }}>
                        Create New Goal
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#546e7a', mb: 4 }}>
                        Set a clear, measurable target for your upcoming performance review.
                    </Typography>

                    <Fade in={!!error || !!successMessage}>
                        <Box sx={{ mb: 3 }}>
                            {error && <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>}
                            {successMessage && <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>{successMessage}</Alert>}
                        </Box>
                    </Fade>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                            <Box sx={{ gridColumn: { xs: '1fr', md: 'span 2' } }}>
                                <TextField
                                    label="Goal Title"
                                    placeholder="e.g. Increase sales by 20%"
                                    fullWidth
                                    required
                                    variant="outlined"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
                                    }}
                                />
                            </Box>

                            <Box sx={{ gridColumn: { xs: '1fr', md: 'span 2' } }}>
                                <TextField
                                    label="Description & Success Criteria"
                                    placeholder="Describe the goal details and how success will be measured..."
                                    fullWidth
                                    multiline
                                    rows={5}
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    InputProps={{
                                        sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
                                    }}
                                />
                            </Box>

                            <FormControl fullWidth required>
                                <InputLabel id="cycle-select-label">Review Cycle</InputLabel>
                                <Select
                                    labelId="cycle-select-label"
                                    value={reviewCycleId}
                                    label="Review Cycle"
                                    onChange={(e) => setReviewCycleId(e.target.value)}
                                    sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}
                                >
                                    {cycles.map((cycle: any) => (
                                        <MenuItem key={cycle._id} value={cycle._id}>
                                            {cycle.name} <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({cycle.status})</Typography>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                InputProps={{
                                    sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate(-1)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    borderColor: '#e0e0e0',
                                    color: '#757575',
                                    '&:hover': {
                                        borderColor: '#bdbdbd',
                                        bgcolor: '#fafafa'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 5,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                    fontWeight: 'bold'
                                }}
                            >
                                {loading ? 'Saving Goal...' : 'Create Goal'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default GoalForm;
