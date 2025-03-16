import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { restoreSession } from "./store/slices/authSlice";
import { AppDispatch } from "./store/store";
import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // בדיקה אם יש טוקן בלוקל סטורג' בטעינה הראשונית
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(restoreSession(token));
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
