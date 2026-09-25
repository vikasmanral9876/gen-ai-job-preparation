import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Protected from "./features/auth/components/Protected";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./features/dashboard/pages/Dashboard";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import InterviewHistory from "./features/interview/pages/InterviewHistory";
import ResumeManager from "./features/resume/pages/ResumeManager";
import Profile from "./features/profile/pages/Profile";
import ProgressAnalytics from "./features/progress/pages/ProgressAnalytics";
import Settings from "./features/settings/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "create",
        element: <Home />,
      },
      {
        path: "interview/history",
        element: <InterviewHistory />,
      },
      {
        path: "interview/:interviewId",
        element: <Interview />,
      },
      {
        path: "resume",
        element: <ResumeManager />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "progress",
        element: <ProgressAnalytics />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);