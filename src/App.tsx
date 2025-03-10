import React from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { Provider } from "react-redux";
import { store } from "./store/store";

const App: React.FC = () => {
  return (
    <Provider store={store}>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
    </Provider>
  );
};

export default App;
