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
import { useNavigate } from "react-router-dom";
import {
  fetchReviewsFailure,
  fetchReviewsStart,
  fetchReviewsSuccess,
} from "../../store/slices/reviewsSlice";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";
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
  const [skills, setSkills] = useState<{ name: string; expertise: number }[]>([
    { name: "JavaScript", expertise: 3 },
  ]); // State for added skills
  const [awards, setAwards] = useState<string[]>([]); // State for added awards
  const [projects, setProjects] = useState<string[]>([]); // State for added projects

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

  const openProjectsSidebar = () => {
    setAddType("projects");
    setOpenSidebar(true);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch(fetchReviewsStart());
      try {
        // Replace this with your actual API call
        const response = await fetch("/api/reviews");
        const data = await response.json();
        dispatch(fetchReviewsSuccess(data));
      } catch (error: any) {
        dispatch(fetchReviewsFailure(error.toString()));
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
                      fontSize: is1024pxScreen ? "0.875rem" : "1rem",
                      color: "#0047AB",
                    }}
                  >
                    Hi! {user?.name},
                  </Typography>
                  <Typography
                    variant="h3"
                    style={{
                      fontSize: is1024pxScreen ? "0.875rem" : "1rem",
                      color: "#0047AB",
                    }}
                  >
                    EMP1234
                    {user?.id}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                      marginTop: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Software Engineer
                    {/* {user.designation} */}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{ fontSize: is1024pxScreen ? "0.675rem" : ".8rem" }}
                  >
                    {user?.email}
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
                      }}
                    >
                      Appraisal Cycle - Year 2024 - Open
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        fontSize: is1024pxScreen ? ".75rem" : ".9rem",
                        textAlign: "center",
                        width: "fit-content",
                        marginTop: 2,
                      }}
                    >
                      01 Aug - 2024 to 31 Sept - 2024
                    </Typography>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={2}
                  width={"100%"}
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
                        fontSize: is1024pxScreen ? ".75rem" : ".9rem",
                        width: "fit-content",
                        marginTop: 2,
                      }}
                    >
                      {dashboardData?.pendingReviews?.length || 0}
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
                  <Box display="flex" alignItems="center" mb={2}>
                    <img
                      src="/path/to/manager/profile.jpg"
                      alt="Manager"
                      style={{
                        width: is1024pxScreen ? 50 : 60,
                        height: is1024pxScreen ? 50 : 60,
                        marginRight: 16,
                      }}
                    />
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          fontWeight: "bold",
                        }}
                      >
                        John Doe
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: "#E3F2FD", // Light blue background
                          color: "#1E88E5", // Professional blue text
                          padding: "4px 8px",
                          borderRadius: "4px",
                          display: "inline-block",
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          fontWeight: "bold",
                        }}
                      >
                        Manager
                      </Box>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <img
                      src="/path/to/manager/profile.jpg"
                      alt="Manager"
                      style={{
                        width: is1024pxScreen ? 50 : 60,
                        height: is1024pxScreen ? 50 : 60,
                        marginRight: 16,
                      }}
                    />
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {dashboardData?.latestReview?.reviewer?.firstName} {dashboardData?.latestReview?.reviewer?.lastName}
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: "#E3F2FD", // Light blue background
                          color: "#1E88E5", // Professional blue text
                          padding: "4px 8px",
                          borderRadius: "4px",
                          display: "inline-block",
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          fontWeight: "bold",
                        }}
                      >
                        Reviewer
                      </Box>
                    </Box>
                  </Box>
                  {/* Additional reviewer block removed for now as we only have one main reviewer usually, or iterate if multiple */}
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
                  <Box display="flex" flexDirection="row" alignItems="center">
                    <Box
                      height={is1024pxScreen ? 150 : 200}
                      bgcolor="#f0f0f0"
                      flex={2}
                      mr={2}
                    >
                      {/* Add your graph component here */}
                    </Box>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        style={{
                          fontSize: is1024pxScreen ? ".8rem" : "1rem",
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        My Summary 2024
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          color: "#1E88E5", // Blue color for percentage
                        }}
                      >
                        Projects handled "-"
                        <span style={{ fontWeight: "bold", cursor: "pointer" }}>
                          {" "}
                          "-"{" "}
                        </span>
                      </Typography>
                      <Divider sx={{ margin: "8px 0" }} />
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        KRA{" "}
                        <span
                          style={{
                            color: "#1E88E5", // Blue color for percentage
                          }}
                        >
                          75%
                        </span>
                      </Typography>
                      <Divider sx={{ margin: "8px 0" }} />
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        Global KRA{" "}
                        <span
                          style={{
                            color: "#1E88E5", // Blue color for percentage
                          }}
                        >
                          75%
                        </span>
                      </Typography>
                      <Divider sx={{ margin: "8px 0" }} />
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        Competencies
                        <span
                          style={{
                            color: "#1E88E5", // Blue color for percentage
                          }}
                        >
                          85%
                        </span>
                      </Typography>
                      <Divider sx={{ margin: "8px 0" }} />
                      <Typography
                        variant="body1"
                        style={{
                          fontSize: is1024pxScreen ? "0.675rem" : ".8rem",
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                        }}
                      >
                        Overall Score
                        <span
                          style={{
                            color: "#1E88E5", // Blue color for percentage
                            // fontWeight: "bold",
                          }}
                        >
                          80%
                        </span>
                      </Typography>
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
                            color: "#1976d2", // Change color on hover
                          },
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
                      >
                        <EditIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ marginBottom: 2 }}>
                    {" "}
                    {/* {{ edit_1 }} Box for Complete Project A */}
                    <Typography>Complete Project A</Typography>
                    <ColoredLinearProgressBar
                      variant="determinate"
                      value={70}
                      marginTop={0}
                    />
                  </Box>

                  <Box sx={{ marginBottom: 2 }}>
                    {" "}
                    {/* {{ edit_2 }} Box for Improve Team Collaboration */}
                    <Typography>Improve Team Collaboration</Typography>
                    <ColoredLinearProgressBar
                      variant="determinate"
                      value={50}
                      marginTop={0.5}
                    />
                  </Box>

                  <Box sx={{ marginBottom: 2 }}>
                    {" "}
                    {/* {{ edit_3 }} Box for Achieve Sales Target */}
                    <Typography>Achieve Sales Target</Typography>
                    <ColoredLinearProgressBar
                      variant="determinate"
                      value={80}
                      marginTop={0.5}
                    />
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
                            color: "#1976d2", // Change color on hover
                          },
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
                      >
                        <EditIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      marginBottom: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Employee of the Month</Typography>
                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                      Mar, 2023
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      marginBottom: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Best Team Player</Typography>
                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                      Jan, 2023
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      marginBottom: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>Outstanding Performance</Typography>
                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                      Dec, 2022
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
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
                      if (newAward && !awards.includes(newAward)) {
                        setAwards([...awards, newAward]);
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
            </Box>
          </Box>
        </Drawer>
      </Box>
    </Container>
  );
};

export default DashboardPage;
