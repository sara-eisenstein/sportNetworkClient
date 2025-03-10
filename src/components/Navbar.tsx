import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Logout from "./auth/Logout";

const Navbar: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <nav>
      <a href="/">Home</a>
      {token ? (
        <>
          <a href="/achievements">Achievements</a>
          <Logout />
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};

export default Navbar;
