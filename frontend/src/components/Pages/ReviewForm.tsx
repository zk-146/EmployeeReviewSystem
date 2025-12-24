import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    Rating,
    Slider,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    clearMessages,
    fetchReviewById,
    saveReviewDraft,
    submitReview,
} from '../../store/slices/reviewsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { AppDispatch } from '../../store';
import { RootState } from '../../store/rootReducer';

const ReviewForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { currentReview, loading, error, successMessage } = useSelector(
        (state: RootState) => state.reviews
    );

    // Local state for form data
    const [responses, setResponses] = useState<any[]>([]);
    const [goalEvaluations, setGoalEvaluations] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchReviewById(id));
        }
        return () => {
            dispatch(clearMessages());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (currentReview) {
            setResponses(currentReview.responses || []);
            setGoalEvaluations(currentReview.goalEvaluations || []);
        }
    }, [currentReview]);

    const handleResponseChange = (questionId: string, field: 'answer' | 'score', value: any) => {
        setResponses((prev) => {
            const existing = prev.find((r) => r.question === questionId);
            if (existing) {
                return prev.map((r) =>
                    r.question === questionId ? { ...r, [field]: value } : r
                );
            } else {
                // If not found (shouldn't happen if initialized from currentReview), add it
                return [...prev, { question: questionId, [field]: value }];
            }
        });
    };

    const handleGoalEvaluationChange = (goalId: string, field: 'achievementLevel' | 'comments', value: any) => {
        setGoalEvaluations((prev) => {
            // goal in evaluation might be an object (populated) or string ID.
            // We need to match safely.
            const existing = prev.find((g) => (g.goal._id || g.goal) === goalId);

            if (existing) {
                return prev.map((g) =>
                    (g.goal._id || g.goal) === goalId ? { ...g, [field]: value } : g
                );
            }
            return prev;
        });
    };

    const handleSaveDraft = () => {
        if (id) {
            dispatch(saveReviewDraft({ id, data: { responses, goalEvaluations } }));
        }
    };

    const handleSubmit = async () => {
        if (id) {
            // Logic could be improved: save draft first, then submit?
            // Or just submit. Submitting usually validates backend side.
            // But let's save first to ensure latest data is there?
            // Actually backend submit checks DB, so we MUST save first.
            await dispatch(saveReviewDraft({ id, data: { responses, goalEvaluations } }));
            // Check for errors? If save fails, don't submit.
            // We can chain this better if we check resultAction.
            dispatch(submitReview(id));
            navigate('/dashboard');
        }
    };

    if (loading && !currentReview) return <Typography>Loading review...</Typography>;
    if (!currentReview) return <Typography>Review not found.</Typography>;

    // Helper to find the actual question text and details from the template
    const getQuestionDetails = (questionId: string) => {
        // currentReview.reviewTemplate might be populated or string. Type says string | object.
        // We assume populated for now based on getReviewById controller.
        const template = currentReview.reviewTemplate as any;
        return template.questions?.find((q: any) => q._id === questionId);
    };

    return (
        <Container maxWidth="md">
            <Box mt={4} mb={4}>
                <Typography variant="h4" gutterBottom>
                    Performance Review
                </Typography>
                <Typography variant="subtitle1" gutterBottom color="textSecondary">
                    Cycle: {(currentReview.reviewCycle as any)?.year || 'N/A'} |
                    Reviewing: {(currentReview.employee as any)?.firstName} {(currentReview.employee as any)?.lastName}
                </Typography>

                {/* Error / Success Messages */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                {/* Section 1: Questions */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Competency Questions
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {responses.map((response, index) => {
                            const question = getQuestionDetails(response.question);
                            if (!question) return null;

                            return (
                                <Box key={response.question} mb={3}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {index + 1}. {question.text} (Weight: {question.weight}%)
                                    </Typography>

                                    <Box mt={1}>
                                        <TextField
                                            label="Your Answer"
                                            multiline
                                            rows={3}
                                            fullWidth
                                            variant="outlined"
                                            value={response.answer || ''}
                                            onChange={(e) => handleResponseChange(response.question, 'answer', e.target.value)}
                                            disabled={currentReview.status !== 'Draft'}
                                        />
                                    </Box>
                                    <Box mt={1} display="flex" alignItems="center">
                                        <Typography component="legend" mr={2}>Rating (1-10):</Typography>
                                        {/* Using Slider or Rating. Rating is usually 5 stars. Backend allows score (number). Let's use Slider 1-10 or Rating / 2 */}
                                        <Rating
                                            name={`rating-${response.question}`}
                                            value={response.score ? response.score / 2 : 0} // Scale 10 to 5 stars
                                            precision={0.5}
                                            onChange={(event, newValue) => {
                                                handleResponseChange(response.question, 'score', newValue ? newValue * 2 : 0);
                                            }}
                                            disabled={currentReview.status !== 'Draft'}
                                        />
                                        <Typography ml={1}>{response.score || 0}/10</Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Section 2: Goals */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Goal Evaluation
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {goalEvaluations.length === 0 && <Typography>No goals assigned for this cycle.</Typography>}

                        {goalEvaluations.map((evaluation) => (
                            <Box key={evaluation._id || evaluation.goal._id} mb={3}>
                                <Typography variant="h6">
                                    {(evaluation.goal as any).title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" paragraph>
                                    {(evaluation.goal as any).description}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography gutterBottom>Achievement Level (%)</Typography>
                                        <Slider
                                            value={evaluation.achievementLevel || 0}
                                            onChange={(e, val) => handleGoalEvaluationChange((evaluation.goal._id || evaluation.goal), 'achievementLevel', val)}
                                            valueLabelDisplay="auto"
                                            step={5}
                                            marks
                                            min={0}
                                            max={100}
                                            disabled={currentReview.status !== 'Draft'}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Comments"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={evaluation.comments || ''}
                                            onChange={(e) => handleGoalEvaluationChange((evaluation.goal._id || evaluation.goal), 'comments', e.target.value)}
                                            disabled={currentReview.status !== 'Draft'}
                                        />
                                    </Grid>
                                </Grid>
                                <Divider sx={{ mt: 2 }} />
                            </Box>
                        ))}
                    </CardContent>
                </Card>

                {/* Actions */}
                {currentReview.status === 'Draft' && (
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" color="primary" onClick={handleSaveDraft}>
                            Save Draft
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            Submit Review
                        </Button>
                    </Box>
                )}

                {currentReview.status !== 'Draft' && (
                    <Box>
                        <Alert severity="info">This review has been submitted ({currentReview.status}).</Alert>
                    </Box>
                )}

            </Box>
        </Container>
    );
};

export default ReviewForm;
