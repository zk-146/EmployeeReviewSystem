import {
  ArrowBackIos,
  ArrowForwardIos,
  Assessment,
  Home,
  Person,
  Star,
  ThumbUp,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getItemStyle = (item: string) => ({
    color:
      location.pathname === item
        ? "#0047AB"
        : hovered === item
        ? "#e0e0e0"
        : "#000",
    transition: "all linear 350ms",
  });

  return (
    <Box
      ref={sidebarRef}
      sx={{
        width: expanded ? 200 : 60,
        height: "100vh",
        backgroundColor: "#f4f4f4",
        transition: "width 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 1,
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        zIndex: 1000,
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center", padding: 2 }}>
        <img src="/path/to/logo.png" alt="Logo" style={{ width: "100%" }} />
      </Box>
      <Divider sx={{ width: "100%" }} />
      <Icon onClick={toggleSidebar} sx={{ marginTop: 2 }}>
        {expanded ? (
          <ArrowBackIos
            style={{ ...getItemStyle("/arrow"), cursor: "pointer" }}
            onMouseEnter={() => {
              setHovered("/arrow");
            }}
            onMouseLeave={() => {
              setHovered("");
            }}
          />
        ) : (
          <ArrowForwardIos
            style={{ ...getItemStyle("/arrow"), cursor: "pointer" }}
            onMouseEnter={() => {
              setHovered("/arrow");
            }}
            onMouseLeave={() => {
              setHovered("");
            }}
          />
        )}
      </Icon>
      <List sx={{ width: "100%" }}>
        <ListItem
          component="li"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate("/dashboard");
            setExpanded(false);
          }}
          onMouseEnter={() => {
            setHovered("/dashboard");
          }}
          onMouseLeave={() => {
            setHovered("");
          }}
        >
          <ListItemIcon>
            <Home style={getItemStyle("/dashboard")} />
          </ListItemIcon>
          {expanded && (
            <ListItemText
              primary="Dashboard"
              style={{
                ...getItemStyle("/dashboard"),
                textWrap: "nowrap",
                marginTop: 0,
                marginBottom: 0,
              }}
            />
          )}
        </ListItem>
        <ListItem
          component="li"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => {
            setHovered("/appraisals");
          }}
          onMouseLeave={() => {
            setHovered("");
          }}
        >
          <ListItemIcon>
            <Star style={getItemStyle("/appraisals")} />
          </ListItemIcon>
          {expanded && (
            <ListItemText
              primary="My Appraisals"
              style={{
                ...getItemStyle("/appraisals"),
                textWrap: "nowrap",
                marginTop: 0,
                marginBottom: 0,
              }}
            />
          )}
        </ListItem>
        <ListItem
          component="li"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => {
            setHovered("/approvals");
          }}
          onMouseLeave={() => {
            setHovered("");
          }}
        >
          <ListItemIcon>
            <ThumbUp style={getItemStyle("/approvals")} fontSize="small" />
          </ListItemIcon>
          {expanded && (
            <ListItemText
              primary="My Approvals"
              style={{
                ...getItemStyle("/approvals"),
                textWrap: "nowrap",
                marginTop: 0,
                marginBottom: 0,
              }}
            />
          )}
        </ListItem>
        <ListItem
          component="li"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => {
            setHovered("/appraise");
          }}
          onMouseLeave={() => {
            setHovered("");
          }}
        >
          <ListItemIcon>
            <Person style={getItemStyle("/appraise")} />
          </ListItemIcon>
          {expanded && (
            <ListItemText
              primary="Appraise List"
              style={{
                ...getItemStyle("/appraise"),
                textWrap: "nowrap",
                marginTop: 0,
                marginBottom: 0,
              }}
            />
          )}
        </ListItem>
        <ListItem
          component="li"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => {
            setHovered("/reports");
          }}
          onMouseLeave={() => {
            setHovered("");
          }}
        >
          <ListItemIcon>
            <Assessment style={getItemStyle("/reports")} />
          </ListItemIcon>
          {expanded && (
            <ListItemText primary="Reports" style={getItemStyle("/reports")} />
          )}
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
