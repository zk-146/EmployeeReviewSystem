import {
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {
  fetchReviewsFailure,
  fetchReviewsStart,
  fetchReviewsSuccess,
} from "../../store/slices/reviewsSlice";
import { fetchDashboardData, updateEmployeeProfile } from "../../store/slices/dashboardSlice";
import { useDispatch, useSelector } from "react-redux";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import { AppDispatch } from "../../store";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close"; // Import close icon
import ColoredLinearProgressBar from "../Organisms/ColoredLinearProgressBar";
import { CustomProgressBar } from "../Organisms/CustomProgressBar";
import { Delete } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { RootState } from "../../store/rootReducer";
import SearchBar from "../Molecules/InputWithIcon";
import { fetchUserProfile } from "../../store/slices/userSlice";

const DashboardPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch type for dispatch
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.profile);
  const reviews = useSelector((state: RootState) => state.reviews.reviews);
  const dashboardData = useSelector((state: RootState) => state.dashboard.data);
  const loading = useSelector(
    (state: RootState) => state.user.loading || state.reviews.loading || state.dashboard.loading
  );

  const theme = useTheme();

  const [openSidebar, setOpenSidebar] = useState(false); // State for sidebar visibility
  const [newSkill, setNewSkill] = useState(""); // State for new skill input
  const [expertiseLevel, setExpertiseLevel] = useState(1); // State for new skill input
  const [addType, setAddType] = useState<"" | "skills" | "awards" | "projects">(
    "skills"
  );
  const [editType, setEditType] = useState<
    "" | "skills" | "awards" | "projects"
  >("skills");
  const [newAward, setNewAward] = useState(""); // State for new award input
  const [newProject, setNewProject] = useState(""); // State for new project input
  const [skills, setSkills] = useState<{ name: string; expertise: number }[]>([]); // State for added skills
  const [awards, setAwards] = useState<{ title: string; date: string }[]>([]); // State for added awards
  const [projects, setProjects] = useState<string[]>([]); // State for added projects

  // Sync with dashboard data when it loads
  useEffect(() => {
    if (dashboardData) {
      if (dashboardData.skills) setSkills(dashboardData.skills);
      if (dashboardData.awards) setAwards(dashboardData.awards);
    }
  }, [dashboardData]);

  const availableSkills = ["JavaScript", "React", "Node.js", "TypeScript"]; // Example skill list
  const expertiseLevels = [1, 2, 3, 4]; // Expertise levels
  const expertiseLabels = ["Beginner", "Intermediate", "Advanced", "Expert"]; // Expertise labels

  const getAvailableSkills = () => {
    return availableSkills.filter(
      (skill) => !skills.some((s) => s.name === skill)
    );
  };

  const handleAddSkill = () => {
    if (newSkill && !skills.some((skill) => skill.name === newSkill)) {
      setSkills([...skills, { name: newSkill, expertise: 1 }]); // Default expertise level to 1
      setNewSkill(""); // Clear input after adding
    }
  };

  const handleDeleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index)); // Remove the skill at the specified index
  };

  const handleExpertiseChange = (index: number, level: number) => {
    const updatedSkills = [...skills];
    updatedSkills[index].expertise = level; // Update expertise level
    setSkills(updatedSkills);
  };

  const openSkillsSidebar = () => {
    setAddType("skills");
    setOpenSidebar(true);
  };

  const openAwardsSidebar = () => {
    setAddType("awards");
    setOpenSidebar(true);
  };

  const handleSaveProfile = () => {
    dispatch(updateEmployeeProfile({ skills, awards }));
    setOpenSidebar(false);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch(fetchReviewsStart());
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:5000/api/reviews", {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchReviewsSuccess(response.data));
      } catch (error: any) {
        dispatch(fetchReviewsFailure(error.response?.data?.message || error.message));
      }
    };

    dispatch(fetchDashboardData());
    dispatch(fetchUserProfile());
    fetchReviews();
  }, [dispatch]);

  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const is1024pxScreen = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    if (!openSidebar) {
      setAddType("");
      setEditType("");
      setNewSkill("");
      setNewAward("");
      setNewProject("");
    }
  }, [openSidebar]);

  return (
    <Container maxWidth={is1024pxScreen ? "md" : "lg"}>
      <Box mt={5} ml={is1024pxScreen ? 8 : 0}>
        {/* <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography> */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box>
            <Grid container spacing={isSmallScreen ? 2 : 4}>
              <Grid item xs={12} md={5}>
                <Box
                  display="flex"
                  alignItems="center"
                  flexDirection={isSmallScreen ? "column" : "row"}
                >
                  <img
                    src="/path/to/dummy/profile.jpg"
                    alt="User"
                    style={{
                      width: is1024pxScreen ? 80 : 100,
                      height: is1024pxScreen ? 80 : 100,
                      marginRight: isSmallScreen ? 0 : 16,
                      marginBottom: isSmallScreen ? 16 : 0,
                    }}
                  />
                  <Box textAlign={isSmallScreen ? "center" : "left"}>
                    <Typography
                      variant="h3"
                      style={{
                        fontSize: is1024pxScreen ? "0.875rem" : "1.2rem",
                        color: "#0047AB",
                        fontWeight: "bold",
                      }}
                    >
                      Hi, {dashboardData?.user?.name || user?.name}!
                    </Typography>
                    <Typography
                      variant="h6"
                      style={{
                        fontSize: is1024pxScreen ? "0.75rem" : "0.9rem",
                        color: "#666",
                        marginBottom: "4px"
                      }}
                    >
                      {dashboardData?.user?.id || "EMP-N/A"}
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        fontSize: is1024pxScreen ? "0.675rem" : ".85rem",
                        fontWeight: "bold",
                        color: "#333"
                      }}
                    >
                      {dashboardData?.user?.position || "Position not set"}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ fontSize: is1024pxScreen ? "0.675rem" : ".8rem", color: "#888" }}
                    >
                      {dashboardData?.user?.department || "Department not set"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} textAlign="center">
                <Box display="flex" flexDirection="column" alignItems="stretch">
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width={"100%"}
                    sx={{
                      cursor: dashboardData?.currentCycle ? "pointer" : "default",
                      padding: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': dashboardData?.currentCycle ? {
                        backgroundColor: '#f5f5f5'
                      } : {}
                    }}
                    onClick={() => {
                      if (dashboardData?.currentCycle) {
                        alert(`Cycle Details:\n${dashboardData.currentCycle.name}\nStatus: ${dashboardData.currentCycle.status}\nStart: ${new Date(dashboardData.currentCycle.startDate).toLocaleDateString()}\nEnd: ${new Date(dashboardData.currentCycle.endDate).toLocaleDateString()}`);
                      }
                    }}
                  >
                    <AutorenewIcon
                      fontSize="medium"
                      sx={{
                        marginRight: 1,
                        backgroundColor: "#fff3d3",
                        padding: 0.8,
                        borderRadius: 60,
                        color: "#ffc63b",
                      }}
                    />
                    <Box ml={1} width={"100%"}>
                      <Typography
                        variant="h3"
                        style={{
                          fontSize: is1024pxScreen ? ".8rem" : "1rem",
                          fontWeight: "bold",
                          width: "fit-content",
                          color: "#333"
                        }}
                      >
                        {dashboardData?.currentCycle?.name || "No Active Cycle"}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? ".7rem" : "0.85rem",
                          textAlign: "left",
                          width: "fit-content",
                          marginTop: 2,
                          color: "#666"
                        }}
                      >
                        {dashboardData?.currentCycle
                          ? `${new Date(dashboardData.currentCycle.startDate).toLocaleDateString()} - ${new Date(dashboardData.currentCycle.endDate).toLocaleDateString()}`
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mt={2}
                    width={"100%"}
                    sx={{
                      cursor: dashboardData?.pendingReviewsCount ? "pointer" : "default",
                      padding: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': dashboardData?.pendingReviewsCount ? {
                        backgroundColor: '#f5f5f5'
                      } : {}
                    }}
                    onClick={() => {
                      if (dashboardData?.pendingReviewsCount) {
                        // Scroll to pending reviews section or show modal
                        alert('Pending reviews functionality: Navigate to review management page');
                      }
                    }}
                  >
                    <AccessTimeIcon
                      fontSize="medium"
                      sx={{
                        marginRight: 1,
                        backgroundColor: "#fff3d3",
                        padding: 0.8,
                        borderRadius: 60,
                        color: "#ffc63b",
                      }}
                    />
                    <Box ml={1} width={"100%"}>
                      <Typography
                        variant="h3"
                        style={{
                          fontSize: is1024pxScreen ? ".8rem" : "1rem",
                          fontWeight: "bold",
                          width: "fit-content",
                        }}
                      >
                        Pending Approvals
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? ".75rem" : "1rem",
                          width: "fit-content",
                          marginTop: 2,
                          fontWeight: "bold",
                          color: "#0047AB"
                        }}
                      >
                        {dashboardData?.pendingReviewsCount || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                md={3}
                textAlign={isSmallScreen ? "center" : "right"}
              >
                <Typography
                  variant="h6"
                  style={{
                    fontSize: is1024pxScreen ? ".8rem" : "1rem",
                    fontWeight: "bold",
                  }}
                >
                  My Appraisal Status
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    fontSize: is1024pxScreen ? ".75rem" : ".9rem",
                    alignSelf: "flex-start",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent={isSmallScreen ? "space-around" : "flex-end"}
                    width={"60%"}
                  >
                    <Box width="100%" mr={1}>
                      <ColoredLinearProgressBar
                        variant="determinate"
                        value={dashboardData?.latestReview?.overallScore ? dashboardData.latestReview.overallScore : 0}
                        // color=""
                        // sx={{ width: "100%" }}
                        marginTop={0}
                      />
                    </Box>
                  </Box>
                  {dashboardData?.latestReview?.overallScore ? `${dashboardData.latestReview.overallScore}/100` : "N/A"}{" "}
                  <InfoOutlinedIcon
                    sx={{
                      color: "darkgray",
                      fontSize: is1024pxScreen ? ".75rem" : ".9rem",
                      marginLeft: 0.5,
                    }}
                  />
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ width: "100%", marginTop: 2, marginBottom: 2 }} />
            <Grid container spacing={isSmallScreen ? 2 : 4}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "100%", // Ensures equal height
                  }}
                >
                  <Box
                    sx={{
                      cursor: dashboardData?.latestReview ? "pointer" : "default",
                      "&:hover": dashboardData?.latestReview ? { backgroundColor: "#f9f9f9" } : {}
                    }}
                    onClick={() => {
                      if (dashboardData?.latestReview?._id) {
                        navigate(`/reviews/${dashboardData.latestReview._id}`);
                      }
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        fontSize: is1024pxScreen ? ".8rem" : "1rem",
                        fontWeight: "bold",
                        marginBottom: "16px",
                      }}
                    >
                      My Appraisal Details
                    </Typography>

                    {/* Manager Section */}
                    {dashboardData?.manager ? (
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: is1024pxScreen ? 40 : 50,
                            height: is1024pxScreen ? 40 : 50,
                            borderRadius: "50%",
                            backgroundColor: "#0047AB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            marginRight: 2
                          }}
                        >
                          {dashboardData.manager.name.charAt(0)}
                        </Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              style={{
                                fontSize: is1024pxScreen ? "0.75rem" : ".9rem",
                                fontWeight: "bold",
                              }}
                            >
                              {dashboardData.manager.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {dashboardData.manager.position}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              backgroundColor: "#E3F2FD",
                              color: "#1E88E5",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                            }}
                          >
                            Manager
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Manager not assigned
                      </Typography>
                    )}

                    {/* Reviewer Section */}
                    {dashboardData?.latestReview?.reviewer && (
                      <Box display="flex" alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: is1024pxScreen ? 40 : 50,
                            height: is1024pxScreen ? 40 : 50,
                            borderRadius: "50%",
                            backgroundColor: "#1E88E5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            marginRight: 2
                          }}
                        >
                          {dashboardData.latestReview.reviewer.firstName.charAt(0)}
                        </Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              style={{
                                fontSize: is1024pxScreen ? "0.75rem" : ".9rem",
                                fontWeight: "bold",
                              }}
                            >
                              {dashboardData.latestReview.reviewer.firstName} {dashboardData.latestReview.reviewer.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {dashboardData.latestReview.reviewer.position || "Reviewer"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              backgroundColor: "#E8F5E9",
                              color: "#4CAF50",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                            }}
                          >
                            Reviewer
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {dashboardData?.latestReview && (
                      <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', textDecoration: 'underline' }}>
                        View Latest Review Details →
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "100%", // Ensures equal height
                  }}
                >
                  <Box display="flex" flexDirection={isSmallScreen ? "column" : "row"} alignItems="flex-start">
                    <Box
                      flex={2}
                      mr={isSmallScreen ? 0 : 2}
                      mb={isSmallScreen ? 2 : 0}
                      width="100%"
                    >
                      <Typography
                        variant="h6"
                        style={{
                          fontSize: is1024pxScreen ? ".8rem" : "1rem",
                          fontWeight: "bold",
                          marginBottom: "16px",
                        }}
                      >
                        Performance Trend
                      </Typography>
                      {/* Bar Chart */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 1.5, mt: 2, px: 2 }}>
                        {(dashboardData?.performanceSummary?.overallTrend || [0, 0, 0, 0]).map((score, i) => (
                          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: '100%',
                                height: `${score}%`,
                                backgroundColor: '#0047AB',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { backgroundColor: '#1E88E5' },
                                position: 'relative',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <Box sx={{
                                position: 'absolute',
                                top: -30,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#333',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                opacity: 0.9
                              }}>
                                {score}%
                              </Box>
                            </Box>
                            <Typography variant="caption" sx={{ mt: 1, color: '#666', fontWeight: 'bold' }}>
                              Q{i + 1}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <Box flex={1} width="100%" sx={{ borderLeft: isSmallScreen ? 'none' : '1px solid #eee', pl: isSmallScreen ? 0 : 3 }}>
                      <Typography
                        variant="h6"
                        style={{
                          fontSize: is1024pxScreen ? ".8rem" : "1rem",
                          fontWeight: "bold",
                          marginBottom: "16px",
                        }}
                      >
                        Summary {dashboardData?.currentCycle?.name?.split(' ').pop() || 2024}
                      </Typography>

                      {[
                        { label: 'KRA Score', value: dashboardData?.performanceSummary?.kra || 0 },
                        { label: 'Global KRA', value: dashboardData?.performanceSummary?.globalKra || 0 },
                        { label: 'Competencies', value: dashboardData?.performanceSummary?.competencies || 0 },
                      ].map((item, idx) => (
                        <Box key={idx} mb={2.5}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2" sx={{ color: '#555' }}>{item.label}</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">{item.value}%</Typography>
                          </Box>
                          <ColoredLinearProgressBar variant="determinate" value={item.value} marginTop={0} />
                        </Box>
                      ))}

                      <Box mt={3} p={1.5} sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <Typography variant="caption" color="textSecondary" display="block">Overall Performance</Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {Math.round(((dashboardData?.performanceSummary?.kra || 0) + (dashboardData?.performanceSummary?.globalKra || 0) + (dashboardData?.performanceSummary?.competencies || 0)) / 3)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={isSmallScreen ? 2 : 4}
              mt={2}
              overflow={"hidden"}
            >
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "100%",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={2}
                  >
                    <Typography variant="h6">
                      Goals for Current Cycle
                    </Typography>
                    <Box>
                      <Box
                        sx={{
                          display: "inline-block",
                          cursor: "pointer",
                          transition: "all linear 200ms",
                          "&:hover": {
                            color: "#1976d2",
                          },
                        }}
                        onClick={() => navigate('/goals/new')}
                      >
                        <AddIcon fontSize="small" />
                      </Box>
                      <Box
                        sx={{
                          display: "inline-block",
                          cursor: "pointer",
                          transition: "all linear 200ms",
                          "&:hover": {
                            color: "#1976d2",
                          },
                        }}
                        onClick={() => navigate('/goals/new')}
                      >
                        <EditIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {dashboardData?.goals && dashboardData.goals.length > 0 ? (
                      dashboardData.goals.map((goal) => (
                        <Box
                          key={goal.id}
                          sx={{
                            marginBottom: 3,
                            cursor: 'pointer',
                            padding: 1.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                          onClick={() => {
                            // Navigate to goal detail/edit page when available
                            alert(`Goal details: ${goal.title}\nProgress: ${goal.progress}%\nStatus: ${goal.status}`);
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>{goal.title}</Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>{goal.progress}%</Typography>
                          </Box>
                          <ColoredLinearProgressBar
                            variant="determinate"
                            value={goal.progress}
                            marginTop={0}
                          />
                        </Box>
                      ))
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          No goals set for this cycle.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "100%",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={2}
                  >
                    <Typography variant="h6">Employee's Skills</Typography>
                    <Box>
                      <Box
                        sx={{
                          display: "inline-block",
                          cursor: "pointer",
                          transition: "all linear 200ms",
                          "&:hover": {
                            color: "#1976d2", // Change color on hover
                          },
                        }}
                        onClick={() => {
                          setAddType("skills");
                          setOpenSidebar(true);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </Box>
                      <Box
                        sx={{
                          display: "inline-block",
                          cursor: "pointer",
                          transition: "all linear 200ms",
                          "&:hover": {
                            color: "#1976d2", // Change color on hover
                          },
                        }}
                        onClick={() => {
                          setEditType("skills");
                          setOpenSidebar(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                  {skills.map((skill, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      justifyContent={"space-between"}
                      mb={1}
                    >
                      <Typography sx={{ mr: 2 }}>{skill.name}</Typography>
                      <CustomProgressBar value={(skill.expertise / 4) * 100} />
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "16px",
                    height: "100%",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom={2}
                  >
                    <Typography variant="h6">My Awards</Typography>
                    <Box>
                      <Box
                        sx={{
                          display: "inline-block",
                          cursor: "pointer",
                          transition: "all linear 200ms",
                          "&:hover": {
                            color: "#1976d2",
                          },
                        }}
                        onClick={() => {
                          setAddType("awards");
                          setOpenSidebar(true);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                  {awards.length > 0 ? (
                    awards.map((award, index) => (
                      <Box
                        key={index}
                        sx={{
                          marginBottom: 2,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography>{award.title}</Typography>
                        <Typography variant="body2" sx={{ marginTop: 1 }}>
                          {award.date ? new Date(award.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No awards added yet.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        <Drawer
          anchor="right"
          open={openSidebar}
          onClose={() => {
            setOpenSidebar(false);
            setAddType("");
            setNewSkill("");
            setNewAward("");
            setNewProject("");
            setExpertiseLevel(1);
          }}
        >
          <Box sx={{ width: 300, padding: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {addType != "" ? (
                <Typography variant="h6">
                  {addType === "skills"
                    ? "Add Skills"
                    : addType === "awards"
                      ? "Add Awards"
                      : "Add Projects"}
                </Typography>
              ) : (
                <Typography variant="h6">
                  {editType === "skills"
                    ? "Edit Skills"
                    : editType === "awards"
                      ? "Edit Awards"
                      : "Edit Projects"}
                </Typography>
              )}
              <IconButton onClick={() => setOpenSidebar(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            <Box mt={2}>
              {addType === "skills" && (
                <>
                  <Typography variant="subtitle1">Add Skill</Typography>
                  <TextField
                    select
                    label="Select Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {getAvailableSkills().map((skill) => (
                      <MenuItem key={skill} value={skill}>
                        {skill}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Select Expertise Level"
                    value={expertiseLevel} // Default to Beginner
                    onChange={(e) => setExpertiseLevel(Number(e.target.value))}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {expertiseLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {expertiseLabels[level - 1]}{" "}
                        {/* Adjust index for labels */}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    onClick={() => {
                      if (
                        newSkill &&
                        !skills.some((skill) => skill.name === newSkill)
                      ) {
                        setSkills([
                          ...skills,
                          { name: newSkill, expertise: expertiseLevel },
                        ]); // Use selected expertise level
                        setNewSkill(""); // Clear input after adding
                        setExpertiseLevel(1); // Reset expertise level to default
                      }
                    }}
                    variant="contained"
                    sx={{ mb: 2 }}
                  >
                    Add Skill
                  </Button>

                  {skills.map((skill, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      justifyContent={"space-between"}
                      mb={1}
                    >
                      <Typography sx={{ mr: 2 }}>{skill.name}</Typography>
                      <CustomProgressBar value={(skill.expertise / 4) * 100} />
                    </Box>
                  ))}
                </>
              )}
              {addType === "awards" && (
                <>
                  <Typography variant="subtitle1">Add Award</Typography>
                  <TextField
                    label="Award Name"
                    value={newAward}
                    onChange={(e) => setNewAward(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button
                    onClick={() => {
                      if (newAward) {
                        setAwards([...awards, { title: newAward, date: new Date().toISOString() }]);
                        setNewAward(""); // Clear input after adding
                      }
                    }}
                    variant="contained"
                    sx={{ mb: 2 }}
                  >
                    Add Award
                  </Button>
                </>
              )}
              {addType === "projects" && (
                <>
                  <Typography variant="subtitle1">Add Project</Typography>
                  <TextField
                    label="Project Name"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Button
                    onClick={() => {
                      if (newProject && !projects.includes(newProject)) {
                        setProjects([...projects, newProject]);
                        setNewProject(""); // Clear input after adding
                      }
                    }}
                    variant="contained"
                  >
                    Add Project
                  </Button>
                </>
              )}
              {editType === "skills" && (
                <>
                  {skills.map((skill, index) => (
                    <Box
                      key={index}
                      display="flex"
                      alignItems="center"
                      justifyContent={"space-between"}
                      mb={1}
                    >
                      <Typography sx={{ mr: 2 }}>{skill.name}</Typography>
                      <CustomProgressBar value={(skill.expertise / 4) * 100} />
                      <IconButton onClick={() => handleDeleteSkill(index)}>
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}
              <Divider sx={{ my: 3 }} />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSaveProfile}
                sx={{ borderRadius: 2 }}
              >
                Save All Changes
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </Container>
  );
};

export default DashboardPage;
