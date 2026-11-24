import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedPostsPage from './pages/SavedPostsPage';
import ProfilePage from './pages/ProfilePage';
import SinglePostPage from './pages/SinglePostPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import HashtagPage from './pages/HashtagPage';
import WorkoutPage from './pages/WorkoutPage';
import SingleWorkoutPage from './pages/SingleWorkoutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TrainingPage from './pages/TrainingPage';
import FoodLogPage from './pages/FoodLogPage';
import AppLayout from './components/layout/AppLayout';
import CalendarPage from './pages/CalendarPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { registerPushToken } from './functions/user/registerPushToken';
import api from './api/axios';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });

  // Synka state om interceptorn loggar ut användaren
  useEffect(() => {
    const handleLoggedOut = () => {
      setCurrentUser(null);
    };

    window.addEventListener("userLoggedOut", handleLoggedOut);
    return () => window.removeEventListener("userLoggedOut", handleLoggedOut);
  }, []);

  // Kontrollera om sparad token fortfarande är giltig vid uppstart
  useEffect(() => {
    const verifyToken = async () => {
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem("currentUser"));
      } catch {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        return;
      }

      if (storedUser?.token) {
        try {
          const response = await api.get("/users/verify");

          if (response.data) {
            const freshUser = { ...storedUser, ...response.data };
            setCurrentUser(freshUser);
            localStorage.setItem("currentUser", JSON.stringify(freshUser));
            registerPushToken();
          }
        } catch {
          localStorage.removeItem("currentUser");
          setCurrentUser(null);
        }
      }
    };

    verifyToken();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Layout Routes */}
        <Route element={<AppLayout currentUser={currentUser} setCurrentUser={setCurrentUser} />}>
          <Route
            path="/home"
            element={<HomePage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          />
          <Route
            path="/users/:userId"
            element={<ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          />
          <Route
            path="/posts/:postId"
            element={<SinglePostPage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          />

          {/* Protected Routes */}
          <Route
            path="/savedPosts"
            element={currentUser ? <SavedPostsPage currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={currentUser ? <SearchPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/category/:categoryName"
            element={currentUser ? <CategoryPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/hashtag/:hashtag"
            element={currentUser ? <HashtagPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/training"
            element={currentUser ? <TrainingPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/workouts"
            element={currentUser ? <WorkoutPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/workouts/:workoutId"
            element={currentUser ? <SingleWorkoutPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/foodlogs"
            element={currentUser ? <FoodLogPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/calendar"
            element={currentUser ? <CalendarPage currentUser={currentUser} /> : <Navigate to="/login" />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;