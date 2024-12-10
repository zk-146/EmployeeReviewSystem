import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import DashboardPage from "./components/Pages/DashboardPage";
import ForgotPasswordPage from "./components/Pages/ForgotPasswordPage";
import LoginPage from "./components/Pages/LoginPage";
import LogoutPage from "./components/Pages/LogoutPage";
import Navbar from "./components/Organisms/Navbar";
import ProfilePage from "./components/Pages/ProfilePage";
import React from "react";
import RegisterPage from "./components/Pages/RegisterPage";
import ResetPasswordPage from "./components/Pages/ResetPasswordPage";
import { RootState } from "./store/rootReducer";
import Sidebar from "./components/Organisms/Sidebar";
import { useSelector } from "react-redux";

const App: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          // width: "100vw",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Navbar />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <div style={{ flex: 1, overflowY: "auto", marginTop: "60px" }}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute
                    isAuthenticated={isAuthenticated}
                    component={LoginPage}
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute
                    isAuthenticated={isAuthenticated}
                    component={RegisterPage}
                  />
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute
                    isAuthenticated={isAuthenticated}
                    component={ForgotPasswordPage}
                  />
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute
                    isAuthenticated={isAuthenticated}
                    component={ResetPasswordPage}
                  />
                }
              />
              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute
                    path="/profile"
                    component={ProfilePage}
                    isAuthenticated={isAuthenticated}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute
                    path="/dashboard"
                    component={DashboardPage}
                    isAuthenticated={isAuthenticated}
                  />
                }
              />
              <Route
                path="/logout"
                element={
                  isAuthenticated ? <LogoutPage /> : <Navigate to="/login" />
                }
              />
              {/* Redirect to login if no match */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};
interface PrivateRouteProps {
  component: React.ComponentType<any>;
  isAuthenticated: boolean;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  isAuthenticated,
  ...rest
}) => (isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />);

interface PublicRouteProps {
  component: React.ComponentType<any>;
  isAuthenticated: boolean;
  path?: string;
  exact?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  isAuthenticated,
  ...rest
}) => (isAuthenticated ? <Navigate to="/profile" /> : <Component {...rest} />);

export default App;
